var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { PureComponent } from "react";
import ReactDom from "react-dom";
import debounce from "lodash.debounce";
import { EventBus, PDFViewer, PDFLinkService, NullL10n, } from "pdfjs-dist/legacy/web/pdf_viewer";
import "pdfjs-dist/web/pdf_viewer.css";
import "../style/pdf_viewer.css";
import "../style/PdfHighlighter.css";
import getBoundingRect from "../lib/get-bounding-rect";
import getClientRects from "../lib/get-client-rects";
import getAreaAsPng from "../lib/get-area-as-png";
import { asElement, getPagesFromRange, getPageFromElement, getWindow, findOrCreateContainerLayer, isHTMLElement, } from "../lib/pdfjs-dom";
import TipContainer from "./TipContainer";
import MouseSelection from "./MouseSelection";
import { scaledToViewport, viewportToScaled } from "../lib/coordinates";
const EMPTY_ID = "empty-id";
export class PdfHighlighter extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            ghostHighlight: null,
            isCollapsed: true,
            range: null,
            scrolledToHighlightId: EMPTY_ID,
            isAreaSelectionInProgress: false,
            tip: null,
            tipPosition: null,
            tipChildren: null,
        };
        this.eventBus = new EventBus();
        this.linkService = new PDFLinkService({
            eventBus: this.eventBus,
            externalLinkTarget: 2,
        });
        this.resizeObserver = null;
        this.containerNode = null;
        this.unsubscribe = () => { };
        this.attachRef = (ref) => {
            var _a;
            const { eventBus, resizeObserver: observer } = this;
            this.containerNode = ref;
            this.unsubscribe();
            if (ref) {
                const { ownerDocument: doc } = ref;
                eventBus.on("textlayerrendered", this.onTextLayerRendered);
                eventBus.on("pagesinit", this.onDocumentReady);
                doc.addEventListener("selectionchange", this.onSelectionChange);
                doc.addEventListener("keydown", this.handleKeyDown);
                (_a = doc.defaultView) === null || _a === void 0 ? void 0 : _a.addEventListener("resize", this.debouncedScaleValue);
                if (observer)
                    observer.observe(ref);
                this.unsubscribe = () => {
                    var _a;
                    eventBus.off("pagesinit", this.onDocumentReady);
                    eventBus.off("textlayerrendered", this.onTextLayerRendered);
                    doc.removeEventListener("selectionchange", this.onSelectionChange);
                    doc.removeEventListener("keydown", this.handleKeyDown);
                    (_a = doc.defaultView) === null || _a === void 0 ? void 0 : _a.removeEventListener("resize", this.debouncedScaleValue);
                    if (observer)
                        observer.disconnect();
                };
            }
        };
        this.hideTipAndSelection = () => {
            this.setState({
                tipPosition: null,
                tipChildren: null,
            });
            this.setState({ ghostHighlight: null, tip: null }, () => this.renderHighlights());
        };
        this.renderTip = () => {
            const { tipPosition, tipChildren } = this.state;
            if (!tipPosition)
                return null;
            const { boundingRect, pageNumber } = tipPosition;
            const page = {
                node: this.viewer.getPageView((boundingRect.pageNumber || pageNumber) - 1)
                    .div,
                pageNumber: boundingRect.pageNumber || pageNumber,
            };
            const pageBoundingClientRect = page.node.getBoundingClientRect();
            const pageBoundingRect = {
                bottom: pageBoundingClientRect.bottom,
                height: pageBoundingClientRect.height,
                left: pageBoundingClientRect.left,
                right: pageBoundingClientRect.right,
                top: pageBoundingClientRect.top,
                width: pageBoundingClientRect.width,
                x: pageBoundingClientRect.x,
                y: pageBoundingClientRect.y,
                pageNumber: page.pageNumber,
            };
            return (React.createElement(TipContainer, { scrollTop: this.viewer.container.scrollTop, pageBoundingRect: pageBoundingRect, style: {
                    left: page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
                    top: boundingRect.top + page.node.offsetTop,
                    bottom: boundingRect.top + page.node.offsetTop + boundingRect.height,
                } }, tipChildren));
        };
        this.onTextLayerRendered = () => {
            this.renderHighlights();
        };
        this.scrollTo = (highlight) => {
            const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position;
            this.viewer.container.removeEventListener("scroll", this.onScroll);
            const pageViewport = this.viewer.getPageView(pageNumber - 1).viewport;
            const scrollMargin = 10;
            this.viewer.scrollPageIntoView({
                pageNumber,
                destArray: [
                    null,
                    { name: "XYZ" },
                    ...pageViewport.convertToPdfPoint(0, scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
                        scrollMargin),
                    0,
                ],
            });
            this.setState({
                scrolledToHighlightId: highlight.id,
            }, () => this.renderHighlights());
            // wait for scrolling to finish
            setTimeout(() => {
                this.viewer.container.addEventListener("scroll", this.onScroll);
            }, 100);
        };
        this.onDocumentReady = () => {
            const { scrollRef } = this.props;
            this.handleScaleValue();
            scrollRef(this.scrollTo);
        };
        this.onSelectionChange = () => {
            const container = this.containerNode;
            const selection = getWindow(container).getSelection();
            if (!selection) {
                return;
            }
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            if (selection.isCollapsed) {
                this.setState({ isCollapsed: true });
                return;
            }
            if (!range ||
                !container ||
                !container.contains(range.commonAncestorContainer)) {
                return;
            }
            this.setState({
                isCollapsed: false,
                range,
            });
            this.debouncedAfterSelection();
        };
        this.onScroll = () => {
            const { onScrollChange } = this.props;
            onScrollChange();
            this.setState({
                scrolledToHighlightId: EMPTY_ID,
            }, () => this.renderHighlights());
            this.viewer.container.removeEventListener("scroll", this.onScroll);
        };
        this.onMouseDown = (event) => {
            if (!isHTMLElement(event.target)) {
                return;
            }
            if (asElement(event.target).closest(".PdfHighlighter__tip-container")) {
                return;
            }
            this.hideTipAndSelection();
        };
        this.handleKeyDown = (event) => {
            if (event.code === "Escape") {
                this.hideTipAndSelection();
            }
        };
        this.afterSelection = () => {
            const { onSelectionFinished } = this.props;
            const { isCollapsed, range } = this.state;
            if (!range || isCollapsed) {
                return;
            }
            const pages = getPagesFromRange(range);
            if (!pages || pages.length === 0) {
                return;
            }
            const rects = getClientRects(range, pages);
            if (rects.length === 0) {
                return;
            }
            const boundingRect = getBoundingRect(rects);
            const viewportPosition = {
                boundingRect,
                rects,
                pageNumber: pages[0].number,
            };
            const content = {
                text: range.toString(),
            };
            const scaledPosition = this.viewportPositionToScaled(viewportPosition);
            this.setTip(viewportPosition, onSelectionFinished(scaledPosition, content, () => this.hideTipAndSelection(), () => this.setState({
                ghostHighlight: { position: scaledPosition },
            }, () => this.renderHighlights())));
        };
        this.debouncedAfterSelection = debounce(this.afterSelection, 500);
        this.handleScaleValue = () => {
            if (this.viewer) {
                this.viewer.currentScaleValue = this.props.pdfScaleValue; //"page-width";
            }
        };
        this.debouncedScaleValue = debounce(this.handleScaleValue, 500);
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(this.debouncedScaleValue);
        }
    }
    componentDidMount() {
        this.init();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.pdfDocument !== this.props.pdfDocument) {
            this.init();
            return;
        }
        if (prevProps.highlights !== this.props.highlights) {
            this.renderHighlights(this.props);
        }
    }
    init() {
        const { pdfDocument } = this.props;
        this.viewer =
            this.viewer ||
                new PDFViewer({
                    container: this.containerNode,
                    eventBus: this.eventBus,
                    textLayerMode: 2,
                    removePageBorders: true,
                    linkService: this.linkService,
                    l10n: NullL10n,
                });
        this.linkService.setDocument(pdfDocument);
        this.linkService.setViewer(this.viewer);
        this.viewer.setDocument(pdfDocument);
        // debug
        window.PdfViewer = this;
    }
    componentWillUnmount() {
        this.unsubscribe();
    }
    findOrCreateHighlightLayer(page) {
        const { textLayer } = this.viewer.getPageView(page - 1) || {};
        if (!textLayer) {
            return null;
        }
        return findOrCreateContainerLayer(textLayer.textLayerDiv, "PdfHighlighter__highlight-layer");
    }
    groupHighlightsByPage(highlights) {
        const { ghostHighlight } = this.state;
        const allHighlights = [...highlights, ghostHighlight].filter(Boolean);
        const pageNumbers = new Set();
        for (const highlight of allHighlights) {
            pageNumbers.add(highlight.position.pageNumber);
            for (const rect of highlight.position.rects) {
                if (rect.pageNumber) {
                    pageNumbers.add(rect.pageNumber);
                }
            }
        }
        const groupedHighlights = {};
        for (const pageNumber of pageNumbers) {
            groupedHighlights[pageNumber] = groupedHighlights[pageNumber] || [];
            for (const highlight of allHighlights) {
                const pageSpecificHighlight = Object.assign(Object.assign({}, highlight), { position: {
                        pageNumber,
                        boundingRect: highlight.position.boundingRect,
                        rects: [],
                        usePdfCoordinates: highlight.position.usePdfCoordinates,
                    } });
                let anyRectsOnPage = false;
                for (const rect of highlight.position.rects) {
                    if (pageNumber === (rect.pageNumber || highlight.position.pageNumber)) {
                        pageSpecificHighlight.position.rects.push(rect);
                        anyRectsOnPage = true;
                    }
                }
                if (anyRectsOnPage || pageNumber === highlight.position.pageNumber) {
                    groupedHighlights[pageNumber].push(pageSpecificHighlight);
                }
            }
        }
        return groupedHighlights;
    }
    showTip(highlight, content) {
        const { isCollapsed, ghostHighlight, isAreaSelectionInProgress } = this.state;
        const highlightInProgress = !isCollapsed || ghostHighlight;
        if (highlightInProgress || isAreaSelectionInProgress) {
            return;
        }
        this.setTip(highlight.position, content);
    }
    scaledPositionToViewport({ pageNumber, boundingRect, rects, usePdfCoordinates, }) {
        const viewport = this.viewer.getPageView(pageNumber - 1).viewport;
        return {
            boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
            rects: (rects || []).map((rect) => scaledToViewport(rect, viewport, usePdfCoordinates)),
            pageNumber,
        };
    }
    viewportPositionToScaled({ pageNumber, boundingRect, rects, }) {
        const viewport = this.viewer.getPageView(pageNumber - 1).viewport;
        return {
            boundingRect: viewportToScaled(boundingRect, viewport),
            rects: (rects || []).map((rect) => viewportToScaled(rect, viewport)),
            pageNumber,
        };
    }
    screenshot(position, pageNumber) {
        const canvas = this.viewer.getPageView(pageNumber - 1).canvas;
        return getAreaAsPng(canvas, position);
    }
    renderHighlights(nextProps) {
        const { highlightTransform, highlights } = nextProps || this.props;
        const { pdfDocument } = this.props;
        const { tip, scrolledToHighlightId } = this.state;
        const highlightsByPage = this.groupHighlightsByPage(highlights);
        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
            const highlightLayer = this.findOrCreateHighlightLayer(pageNumber);
            if (highlightLayer) {
                ReactDom.render(React.createElement("div", null, (highlightsByPage[String(pageNumber)] || []).map((_a, index) => {
                    var { position, id } = _a, highlight = __rest(_a, ["position", "id"]);
                    // @ts-ignore
                    const viewportHighlight = Object.assign({ id, position: this.scaledPositionToViewport(position) }, highlight);
                    if (tip && tip.highlight.id === String(id)) {
                        this.showTip(tip.highlight, tip.callback(viewportHighlight));
                    }
                    const isScrolledTo = Boolean(scrolledToHighlightId === id);
                    return highlightTransform(viewportHighlight, index, (highlight, callback) => {
                        this.setState({
                            tip: { highlight, callback },
                        });
                        this.showTip(highlight, callback(highlight));
                    }, this.hideTipAndSelection, (rect) => {
                        const viewport = this.viewer.getPageView((rect.pageNumber || pageNumber) - 1).viewport;
                        return viewportToScaled(rect, viewport);
                    }, (boundingRect) => this.screenshot(boundingRect, pageNumber), isScrolledTo);
                })), highlightLayer);
            }
        }
    }
    setTip(position, inner) {
        this.setState({
            tipPosition: position,
            tipChildren: inner,
        });
    }
    toggleTextSelection(flag) {
        this.viewer.viewer.classList.toggle("PdfHighlighter--disable-selection", flag);
    }
    render() {
        const { onSelectionFinished, enableAreaSelection } = this.props;
        return (React.createElement("div", { onPointerDown: this.onMouseDown },
            React.createElement("div", { ref: this.attachRef, className: "PdfHighlighter", onContextMenu: (e) => e.preventDefault() },
                React.createElement("div", { className: "pdfViewer" }),
                this.renderTip(),
                typeof enableAreaSelection === "function" ? (React.createElement(MouseSelection, { onDragStart: () => this.toggleTextSelection(true), onDragEnd: () => this.toggleTextSelection(false), onChange: (isVisible) => this.setState({ isAreaSelectionInProgress: isVisible }), shouldStart: (event) => enableAreaSelection(event) &&
                        isHTMLElement(event.target) &&
                        Boolean(asElement(event.target).closest(".page")), onSelection: (startTarget, boundingRect, resetSelection) => {
                        const page = getPageFromElement(startTarget);
                        if (!page) {
                            return;
                        }
                        const pageBoundingRect = Object.assign(Object.assign({}, boundingRect), { top: boundingRect.top - page.node.offsetTop, left: boundingRect.left - page.node.offsetLeft, pageNumber: page.number });
                        const viewportPosition = {
                            boundingRect: pageBoundingRect,
                            rects: [],
                            pageNumber: page.number,
                        };
                        const scaledPosition = this.viewportPositionToScaled(viewportPosition);
                        const image = this.screenshot(pageBoundingRect, pageBoundingRect.pageNumber);
                        this.setTip(viewportPosition, onSelectionFinished(scaledPosition, { image }, () => this.hideTipAndSelection(), () => this.setState({
                            ghostHighlight: {
                                position: scaledPosition,
                                content: { image },
                            },
                        }, () => {
                            resetSelection();
                            this.renderHighlights();
                        })));
                    } })) : null)));
    }
}
PdfHighlighter.defaultProps = {
    pdfScaleValue: "auto",
};
//# sourceMappingURL=PdfHighlighter.js.map
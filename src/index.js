export default class Guide {
    constructor({onClose = null} = {}) {
        this.onClose = onClose
        this.maskEl = null
        this.el = null
        this.path = null
        this.popover = null
        this.popoverContent = 'Popover'
    }
    _renderPathBound = this.renderPath.bind(this)
    start({el, onClose, popoverContent}) {
        this.el = el
        if(popoverContent) this.popoverContent = popoverContent
        if(onClose) this.onClose = onClose
        document.body.appendChild(Guide._createSVG(this))
        this.createPopover()
        scrollTo(0, Guide._getElementDistanceFromViewportTopAndLeft(el).top - 20)
        addEventListener('scroll', this._renderPathBound)
    }
    clear() {
        this.maskEl && this.maskEl.remove()
        this.popover && this.popover.remove()
        removeEventListener('scroll', this._renderPathBound)
    }
    renderPath() {
        console.log('滾動監聽');
        const elVisible = Guide._elComputer(this.el)
        this.path.setAttribute('d', Guide._renderD(elVisible))
    }
    createPopover() {
        const {h, top, left} = Guide._elComputer(this.el)
        const pageY = window.pageYOffset
        const isNeedFixed = Guide._hasFixedAncestor(this.el)
        const popover = document.createElement('div')
        popover.innerHTML = this.popoverContent;
        popover.classList.add('guide_popover')
        popover.style.top = top + pageY + h + 20 + 'px'
        popover.style.left = left + 'px'
        if(isNeedFixed) popover.classList.add("guide_popover_fixed")
        const popoverArrow = document.createElement('div')
        popoverArrow.classList.add('guide_popover_arrow_down')
        popover.appendChild(popoverArrow)
        const colseEl = this.findElementOfHasAttr(popover, 'gpv-close')
        if(colseEl) colseEl.onclick = this.onClose
        document.body.appendChild(popover);
        this.popover = popover
    }

    findElementOfHasAttr(startNode, attrName ,isFound = false) {
        if (startNode.getAttribute(attrName) !== null) return startNode
        for (let i = 0; i < startNode.children.length; i++) {
          const child = startNode.children[i]
          const nextElement = this.findElementOfHasAttr(child, attrName, isFound || startNode.getAttribute(attrName) !== null)
          if (nextElement !== null) return nextElement
        }
        return null;
    }

    
    static _hasFixedAncestor(el) {
        if (el === null) return false;
        const styles = window.getComputedStyle(el);
        const position = styles.getPropertyValue('position');
        if (position === 'fixed') return true
        return Guide._hasFixedAncestor(el.offsetParent);
    }
    static _createSVG(ins) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100vw");
        svg.setAttribute("height", "100vh");
        svg.classList.add('guide_mask')
        svg.appendChild(this._createPath({ins, el: ins.el}))
        ins.maskEl = svg
        return svg
    }
    static _createPath({ins, el}) {
        const elVisible = this._elComputer(el)
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const d = this._renderD(elVisible)
        path.setAttribute("d", d);
        ins.path = path
        return path
    }
    static _elComputer(el) {
        const {top, left} = Guide._getElementDistanceFromViewportTopAndLeft(el)
        return {
            w: el.offsetWidth,
            h: el.offsetHeight,
            top, left
        }
    }
    static _getElementDistanceFromViewportTopAndLeft(el) {
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
        };
    }
    static _renderD(elVisible) {
        const screen = {h: innerHeight, w: innerWidth}
        return `M${screen.w},${screen.h}H0V0H${screen.w}V${screen.h}ZM${elVisible.left},${elVisible.top}a0,0,0,0,0-0,0V${elVisible.top + elVisible.h}a0,0,0,0,0,0,0H${elVisible.left + elVisible.w}a0,0,0,0,0,0-0V${elVisible.top}a0,0,0,0,0-0-0Z`
    }
}
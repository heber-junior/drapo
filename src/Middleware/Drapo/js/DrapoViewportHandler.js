"use strict";
class DrapoViewportHandler {
    get Application() {
        return (this._application);
    }
    constructor(application) {
        this._viewportPropertyName = 'viewport';
        this.MAX_SIZE = 10000;
        this._application = application;
    }
    CreateViewportControlFlow(sector, el, elTemplate, dataKey, key, dataKeyIteratorRange, data) {
        const scroll = this.GetScrollViewport(el);
        if (scroll == null)
            return (null);
        const viewportBefore = this.GetElementViewport(el);
        if (viewportBefore != null) {
            viewportBefore.IsActive = true;
            return (viewportBefore);
        }
        const elScroll = scroll[0];
        const height = this.GetElementHeight(elScroll);
        if (height == null)
            return (null);
        const viewport = new DrapoViewport();
        viewport.Sector = sector;
        viewport.Element = el;
        viewport.ElementTemplate = elTemplate;
        viewport.ElementScroll = elScroll;
        viewport.DataKey = dataKey;
        viewport.Key = key;
        viewport.DataKeyIteratorRange = dataKeyIteratorRange;
        viewport.Data = data;
        viewport.HeightScroll = height;
        viewport.HeightBefore = scroll[1];
        viewport.HeightAfter = scroll[2];
        viewport.HeightBallonBefore = 0;
        viewport.HeightBallonAfter = 0;
        viewport.DataStart = 0;
        viewport.DataEnd = data.length;
        viewport.DataLength = data.length;
        if ((elScroll.scrollTop) && elScroll.scrollTop > 0) {
            this.Application.Binder.UnbindControlFlowViewport(viewport);
            viewport.ScrollTop = viewport.ElementScroll.scrollTop;
            viewport.HeightItem = this.GetElementItemHeight(el);
            if (viewport.HeightItem != null) {
                const view = this.GetViewFactorCurrent(viewport);
                viewport.DataStart = view[0];
                viewport.DataEnd = view[1];
            }
        }
        return (viewport);
    }
    GetElementViewport(el) {
        const elAny = el;
        const viewportBefore = elAny[this._viewportPropertyName];
        if (viewportBefore != null) {
            return (viewportBefore);
        }
        return (null);
    }
    HasElementViewport(el) {
        return (this.GetElementViewport(el) != null);
    }
    CreateViewportControlFlowBallonBefore(viewport, lastInserted) {
        if (viewport === null)
            return (lastInserted);
        const elBallonBeforeInDOM = this.GetBallonBefore(lastInserted);
        if (elBallonBeforeInDOM == null) {
            const elBallonBefore = document.createElement('div');
            elBallonBefore.setAttribute('d-ballon', 'before');
            elBallonBefore.style.width = '100%';
            this.FillBallon(elBallonBefore, viewport.HeightBallonBefore);
            viewport.ElementBallonBefore = elBallonBefore;
            lastInserted.after(elBallonBefore);
            return (elBallonBefore);
        }
        else {
            if (viewport.IsActive)
                return (elBallonBeforeInDOM);
            this.FillBallon(elBallonBeforeInDOM, viewport.HeightBallonBefore);
            viewport.ElementBallonBefore = elBallonBeforeInDOM;
            const elParent = elBallonBeforeInDOM.parentElement;
            while (elParent.children.length > 2)
                elParent.lastElementChild.remove();
            return (elBallonBeforeInDOM);
        }
    }
    FillBallon(elBallon, height, isFull = true) {
        if (isFull) {
            elBallon.style.height = height + 'px';
        }
        else {
            while (elBallon.childNodes.length > 0)
                elBallon.childNodes[0].remove();
            if (height < this.MAX_SIZE) {
                elBallon.style.height = height + 'px';
            }
            else {
                elBallon.style.height = 'auto';
                while (height > 0) {
                    const elBallonItem = document.createElement('div');
                    elBallonItem.style.width = '100%';
                    elBallonItem.style.height = (height > this.MAX_SIZE ? this.MAX_SIZE : height) + 'px';
                    elBallon.appendChild(elBallonItem);
                    height = height - this.MAX_SIZE;
                    if (height <= 0)
                        height = 0;
                }
            }
        }
    }
    GetBallonBefore(elTemplate) {
        const elTemplateNext = elTemplate.nextElementSibling;
        if (elTemplateNext == null)
            return (null);
        const isBallonBefore = elTemplateNext.getAttribute('d-ballon') === 'before';
        if (!isBallonBefore)
            return (null);
        return (elTemplateNext);
    }
    GetElementItemHeight(elTemplate) {
        const elParent = elTemplate.parentElement;
        if (elParent == null)
            return (null);
        if (elParent.children.length < 4)
            return (null);
        const elBallonBefore = elTemplate.nextElementSibling;
        const elItem = elBallonBefore.nextElementSibling;
        const height = this.GetElementHeight(elItem);
        return (height);
    }
    AppendViewportControlFlowBallonAfter(viewport, fragment) {
        if ((viewport === null) || (viewport.IsActive))
            return;
        const elBallonAfter = document.createElement('div');
        elBallonAfter.style.width = '100%';
        this.FillBallon(elBallonAfter, viewport.HeightBallonAfter);
        viewport.ElementBallonAfter = elBallonAfter;
        fragment.appendChild(elBallonAfter);
    }
    ActivateViewportControlFlow(viewport, elItem) {
        if ((viewport === null) || (viewport.IsActive))
            return;
        if (viewport.ScrollTop != null) {
            this.UpdateValuesBallon(viewport);
            this.UpdateElementsBallon(viewport);
            viewport.ElementScroll.scrollTop = viewport.ScrollTop;
        }
        this.UpdateHeightItem(viewport, elItem, false);
        const viewportElementAny = viewport.Element;
        viewportElementAny[this._viewportPropertyName] = viewport;
        this.Application.Binder.BindControlFlowViewport(viewport);
    }
    DestroyViewportControlFlow(viewport) {
        this.Application.Binder.UnbindControlFlowViewport(viewport);
        const viewportElementAny = viewport.Element;
        viewportElementAny[this._viewportPropertyName] = null;
    }
    GetViewportControlFlowStart(viewport, start) {
        if (viewport === null)
            return (start);
        return (viewport.DataStart);
    }
    GetViewportControlFlowEnd(viewport, length) {
        if (viewport === null)
            return (length);
        return (viewport.DataEnd);
    }
    UpdateHeightItem(viewport, elItem, updateValues = true) {
        if (viewport === null)
            return (false);
        if (viewport.HeightItem !== null)
            return (false);
        if (elItem === null)
            return (false);
        const height = this.GetElementHeight(elItem);
        if (height === null)
            return (false);
        viewport.HeightItem = height;
        if (updateValues)
            this.UpdateValues(viewport);
        return (true);
    }
    HasHeightChanged(viewport) {
        if (viewport == null)
            return (false);
        const height = this.GetElementHeight(viewport.ElementScroll);
        if (height < 100) {
            const scrollHeight = viewport.ElementScroll.scrollHeight;
            if (viewport.HeightScrollScroll == scrollHeight)
                return (false);
            viewport.HeightScrollScroll = scrollHeight;
            return (true);
        }
        if (viewport.HeightScroll == height)
            return (false);
        viewport.HeightScroll = height;
        return (true);
    }
    UpdateValues(viewport) {
        const heightData = viewport.HeightScroll;
        if (heightData < 0)
            return;
        const heightDataFactor = heightData * viewport.Factor;
        const dataItems = Math.floor(heightDataFactor / viewport.HeightItem);
        viewport.DataEnd = dataItems < viewport.DataEnd ? dataItems : viewport.DataEnd;
        this.UpdateValuesBallon(viewport);
    }
    UpdateValuesBallon(viewport) {
        viewport.HeightBallonBefore = viewport.DataStart * viewport.HeightItem;
        viewport.HeightBallonAfter = (viewport.DataLength - viewport.DataEnd) * viewport.HeightItem;
    }
    UpdateElementsBallon(viewport) {
        this.FillBallon(viewport.ElementBallonBefore, viewport.HeightBallonBefore);
        this.FillBallon(viewport.ElementBallonAfter, viewport.HeightBallonAfter);
    }
    GetElementHeightRect(el) {
        const rect = el.getBoundingClientRect();
        return (rect.height);
    }
    GetElementStyleHeight(el) {
        const elStyle = window.getComputedStyle(el);
        const heightString = elStyle.getPropertyValue('height');
        if (heightString.indexOf('px') < 0)
            return (0);
        const height = this.Application.Parser.ParsePixels(heightString);
        return (height);
    }
    GetElementHeight(el) {
        let height = this.GetElementHeightRect(el);
        if (height != 0)
            return (height);
        height = this.GetElementStyleHeight(el);
        if (height != 0)
            return (height);
        return (0);
    }
    GetScrollViewport(el) {
        let elCurrent = el;
        let isFirst = true;
        let heightBefore = 0;
        let heightAfter = 0;
        while (elCurrent != null) {
            if (this.HasOverflowY(elCurrent))
                return ([elCurrent, heightBefore, heightAfter]);
            const elParent = elCurrent.parentElement;
            if (elParent != null) {
                if (isFirst) {
                    isFirst = false;
                }
                else {
                    let isBefore = true;
                    for (let i = 0; i < elParent.children.length; i++) {
                        const elChild = elParent.children[i];
                        if (elChild === elCurrent) {
                            isBefore = false;
                        }
                        else {
                            const height = this.GetElementHeight(elChild);
                            if (isBefore)
                                heightBefore = heightBefore + height;
                            else
                                heightAfter = heightAfter + height;
                        }
                    }
                }
            }
            elCurrent = elParent;
        }
        return (null);
    }
    HasOverflowY(el) {
        const style = window.getComputedStyle(el);
        const overflow = style.getPropertyValue('overflow');
        if (this.IsOverflowEnabled(overflow))
            return (true);
        const overflowY = style.getPropertyValue('overflow-y');
        if (this.IsOverflowEnabled(overflowY))
            return (true);
        return (false);
    }
    IsOverflowEnabled(value) {
        if (value === 'auto')
            return (true);
        if (value === 'scroll')
            return (true);
        if (value === 'hidden')
            return (true);
        return (false);
    }
    GetView(viewport) {
        let rowsBeforeRemove = null;
        let rowsBeforeInsertStart = null;
        let rowsBeforeInsertEnd = null;
        let rowsAfterRemove = null;
        let rowsAfterInsertStart = null;
        let rowsAfterInsertEnd = null;
        const view = this.GetViewFactorCurrent(viewport);
        const viewStart = view[0];
        const viewEnd = view[1];
        if ((viewStart >= viewport.DataStart) && (viewEnd <= viewport.DataEnd))
            return (null);
        if ((viewport.DataStart === viewStart) && (viewport.DataEnd === viewEnd))
            return (null);
        if ((viewStart > viewport.DataEnd) || (viewEnd < viewport.DataStart)) {
            rowsBeforeRemove = -1;
            rowsAfterInsertStart = viewStart;
            rowsAfterInsertEnd = viewEnd;
        }
        else {
            if (viewport.DataStart < viewStart) {
                rowsBeforeRemove = viewStart - viewport.DataStart;
            }
            else if (viewStart < viewport.DataStart) {
                rowsBeforeInsertStart = viewStart;
                rowsBeforeInsertEnd = viewport.DataStart;
            }
            if (viewport.DataEnd > viewEnd) {
                rowsAfterRemove = viewport.DataEnd - viewEnd;
            }
            else if (viewEnd > viewport.DataEnd) {
                rowsAfterInsertStart = viewport.DataEnd;
                rowsAfterInsertEnd = viewEnd;
            }
        }
        viewport.DataStart = viewStart;
        viewport.DataEnd = viewEnd;
        this.UpdateValuesBallon(viewport);
        return ([rowsBeforeRemove, rowsBeforeInsertStart, rowsBeforeInsertEnd, rowsAfterRemove, rowsAfterInsertStart, rowsAfterInsertEnd]);
    }
    GetViewFactorCurrent(viewport) {
        const viewHeight = viewport.HeightScroll;
        const viewItems = viewHeight / viewport.HeightItem;
        const scrollTop = viewport.ElementScroll.scrollTop + viewHeight;
        const scrollTopLessBefore = scrollTop - viewport.HeightBefore;
        const scrollTopLessBeforeValid = scrollTopLessBefore > 0 ? scrollTopLessBefore : 0;
        const views = scrollTopLessBeforeValid / viewHeight;
        let viewsStart = views - viewport.Factor;
        if (viewsStart < 0)
            viewsStart = 0;
        const viewsEnd = views + viewport.Factor;
        const rowStart = Math.round(viewsStart * viewItems);
        let rowEnd = Math.ceil(viewsEnd * viewItems);
        if (rowEnd > viewport.DataLength)
            rowEnd = viewport.DataLength;
        return ([rowStart, rowEnd]);
    }
}
//# sourceMappingURL=DrapoViewportHandler.js.map
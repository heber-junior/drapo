var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function linkedcubeConstructor(el, app) {
    return __awaiter(this, void 0, void 0, function* () {
        let instance = new LinkedCube(el, app);
        yield instance.Initalize();
        return (instance);
    });
}
class LinkedCube {
    constructor(el, app) {
        this._el = null;
        this._cube = null;
        this._el = el;
        this._app = app;
    }
    Initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._cube = new DrapoLinkedCube();
            const type = this._el.getAttribute('dc-type');
            if (type === 'add') {
                yield this.Add('p1', 'r1', 'c1', 'v1');
                yield this.Add('p1', 'r2', 'c1', 'v2');
                yield this.Add('p1', 'r2', 'c2', 'v3');
                yield this.Add('p1', 'r1', 'c3', 'v4');
                yield this.Add('p2', 'r2', 'c1', 'v5');
                yield this.Add('p3', 'r1', 'c1', 'v6');
                yield this.Add('p2', 'r1', 'c1', 'v7');
                yield this.Add('p2', 'r1', 'c2', 'v8');
                yield this.Add('p0', 'r1', 'c1', 'v9');
            }
            else if (type === 'remove') {
                yield this.Add('p1', 'r1', 'c1', 'v1');
                yield this.Add('p1', 'r2', 'c1', 'v2');
                yield this.Add('p1', 'r2', 'c2', 'v3');
                yield this.Add('p1', 'r1', 'c3', 'v4');
                yield this.Add('p2', 'r2', 'c1', 'v5');
                yield this.Add('p3', 'r1', 'c1', 'v6');
                yield this.Add('p2', 'r1', 'c1', 'v7');
                yield this.Add('p2', 'r1', 'c2', 'v8');
                yield this.Add('p0', 'r1', 'c1', 'v9');
                yield this.Remove('p2', '', '');
                yield this.Remove('p1', 'r2', 'c1');
                yield this.Remove('p0', 'r1', '');
            }
        });
    }
    GetElementCube() {
        return this._el.children[2];
    }
    Add(page, row, column, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = [page, row, column];
            this._cube.AddOrUpdate(context, value);
            yield this.Render();
        });
    }
    Clear() {
        return __awaiter(this, void 0, void 0, function* () {
            this._cube.Clear();
            this.Render();
        });
    }
    Remove(page, row, column) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = [];
            if (page != '')
                context.push(page);
            if (row != '')
                context.push(row);
            if (column != '')
                context.push(column);
            this._cube.Remove(context);
            yield this.Render();
        });
    }
    Render() {
        return __awaiter(this, void 0, void 0, function* () {
            const elCube = this.GetElementCube();
            while (elCube.children.length > 0)
                elCube.removeChild(elCube.children[0]);
            const fragment = document.createDocumentFragment();
            const node = this._cube.GetHead();
            this.InsertNodeElement(fragment, node, null, 0, 0);
            elCube.appendChild(fragment);
        });
    }
    InsertNodeElement(fragment, node, nodePrevious, index, identation) {
        const elDiv = document.createElement('div');
        const elSpan = document.createElement('span');
        elSpan.style.left = (identation * 20) + 'px';
        elSpan.textContent = this.CreateNodeText(node, nodePrevious, index);
        if (this.HasError(node, nodePrevious, index))
            elSpan.style.color = 'red';
        else
            elSpan.style.color = 'green';
        elDiv.appendChild(elSpan);
        fragment.appendChild(elDiv);
        if (node.Next === null)
            return;
        for (let i = node.Next.length - 1; i >= 0; i--) {
            const nodeNext = node.Next[i];
            if (nodeNext === null)
                continue;
            this.InsertNodeElement(fragment, nodeNext, node, i, i);
        }
    }
    CreateNodeText(node, nodePrevious, index) {
        let text = '[' + this.CreateContextText(node.Context) + '] ' + node.Value;
        if (nodePrevious !== null) {
            text = text + ' : ' + index + ' <= (' + this.CreateContextText(nodePrevious.Context) + ')';
        }
        return (text);
    }
    CreateContextText(context) {
        let text = '';
        for (let i = 0; i < context.length; i++) {
            if (i > 0)
                text = text + ',';
            text = text + context[i];
        }
        return (text);
    }
    HasError(node, nodePrevious, index) {
        if (nodePrevious === null)
            return (false);
        for (let i = 0; i < index; i++) {
            if (node.Context[i] !== nodePrevious.Context[i])
                return (true);
        }
        return (false);
    }
}
//# sourceMappingURL=linkedcube.js.map
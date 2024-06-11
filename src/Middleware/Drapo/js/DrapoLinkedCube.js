"use strict";
class DrapoLinkedCube {
    constructor() {
        this._head = null;
    }
    AddOrUpdate(context, value) {
        if (this._head === null) {
            this._head = this.CreateNode(context, value);
            return (this._head);
        }
        if (context === null)
            throw new Error('Drapo: The context in DrapoLinkedcube cant be null');
        if (this._head.Context.length != context.length)
            throw new Error('Drapo: The context to insert in linked cube must be the same lenght of the context lenght of head');
        let node = this._head;
        let nodePrevious = null;
        let nodePreviousIndex = null;
        let compare = 0;
        for (let i = 0; i < context.length; i++) {
            const contextValue = context[i];
            while ((compare = this.Compare(contextValue, node.Context[i])) !== 0) {
                if (compare < 0) {
                    const nodeNew = this.CreateNode(context, value);
                    this.AddNodeNext(nodeNew, node, i);
                    if (node === this._head)
                        this._head = nodeNew;
                    else if (nodePrevious !== null)
                        this.AddNodeNext(nodePrevious, nodeNew, nodePreviousIndex);
                    return (nodeNew);
                }
                else {
                    nodePrevious = node;
                    nodePreviousIndex = i;
                    const nodeNext = this.GetNodeNext(node, i);
                    if (nodeNext === null) {
                        const nodeNew = this.CreateNode(context, value);
                        this.AddNodeNext(node, nodeNew, i);
                        return (nodeNew);
                    }
                    else {
                        node = nodeNext;
                    }
                }
            }
        }
        node.Value = value;
        return (node);
    }
    Get(context) {
        let entry = null;
        let node = this._head;
        let index = 0;
        while (node !== null) {
            if (this.IsEqualContext(node.Context, context))
                return (node.Value);
            entry = this.GetNextInContext(node, context, index);
            if (entry === null)
                break;
            node = entry[0];
            index = entry[1];
        }
        return (null);
    }
    GetNode(context) {
        if (context == null)
            return (null);
        let entry = null;
        let node = this._head;
        let index = 0;
        while (node !== null) {
            if (this.IsEqualContext(context, node.Context, false))
                return (node);
            entry = this.GetNextInContext(node, context, index);
            if (entry === null)
                break;
            node = entry[0];
            index = entry[1];
        }
        return (null);
    }
    Clear() {
        this._head = null;
    }
    Remove(context) {
        if (this._head === null)
            return (null);
        let node = this._head;
        let nodePrevious = null;
        let nodePreviousIndex = null;
        let compare = 0;
        for (let i = 0; ((i < context.length) && (node !== null)); i++) {
            const contextValue = context[i];
            while ((compare = this.Compare(contextValue, node.Context[i])) !== 0) {
                if (compare < 0) {
                    return (null);
                }
                else {
                    nodePrevious = node;
                    nodePreviousIndex = i;
                    const nodeNext = this.GetNodeNext(node, i);
                    node = nodeNext;
                    if (node === null)
                        return (null);
                }
            }
        }
        if (node !== null) {
            const isContextToRemove = context.length < this._head.Context.length;
            const nodeNext = this.GetNextReverse(node, isContextToRemove ? context.length - 1 : null);
            const nodeNextIndex = this.GetNextReverseIndex(node, isContextToRemove ? context.length - 1 : null);
            if (nodePrevious === null) {
                if (nodeNext !== null) {
                    this.MoveLinks(nodeNext, node, nodeNextIndex);
                }
                this._head = nodeNext;
            }
            else {
                this.MoveLinks(nodeNext, node, nodeNextIndex);
                this.AddNodeNext(nodePrevious, nodeNext, nodePreviousIndex);
            }
        }
        return (node);
    }
    GetHead() {
        return (this._head);
    }
    CreateNode(context, value) {
        const node = new DrapoLinkedCubeNode();
        node.Context = context;
        node.Value = value;
        return (node);
    }
    GetNextInContext(node, context, index) {
        for (let i = index; i < context.length; i++) {
            const compare = this.Compare(context[i], node.Context[i]);
            if (compare < 0)
                return (null);
            else if (compare === 0)
                continue;
            if ((node.Next === null) || (node.Next.length <= i))
                return (null);
            return ([node.Next[i], i]);
        }
        return (null);
    }
    Compare(value1, value2) {
        if (value1 < value2)
            return (-1);
        if (value1 > value2)
            return (1);
        return (0);
    }
    GetNextReverse(node, index = null) {
        if (node.Next === null)
            return (null);
        let start = index !== null ? index : node.Next.length - 1;
        if (start >= node.Next.length)
            start = node.Next.length - 1;
        for (let i = start; i >= 0; i--) {
            const nodeNext = node.Next[i];
            if (nodeNext !== null)
                return (nodeNext);
        }
        return (null);
    }
    GetNextReverseIndex(node, index = null) {
        if (node.Next === null)
            return (null);
        let start = index !== null ? index : node.Next.length - 1;
        if (start >= node.Next.length)
            start = node.Next.length - 1;
        for (let i = start; i >= 0; i--) {
            const nodeNext = node.Next[i];
            if (nodeNext !== null)
                return (i);
        }
        return (null);
    }
    IsEqualContext(context1, context2, checkSize = true) {
        if ((checkSize) && (context1.length != context2.length))
            return (false);
        for (let i = 0; i < context1.length; i++)
            if (context1[i] !== context2[i])
                return (false);
        return (true);
    }
    EnsureNodeNext(node, index) {
        if (node.Next === null)
            node.Next = [];
        while (node.Next.length <= index)
            node.Next.push(null);
    }
    AddNodeNext(node, nodeNext, index) {
        this.EnsureNodeNext(node, index);
        node.Next[index] = nodeNext;
        if (nodeNext === null)
            return;
        if (nodeNext.Next === null)
            return;
        this.MoveLinks(node, nodeNext, index);
    }
    MoveLinks(node, nodeNext, index = null) {
        if (node === null)
            return;
        if (nodeNext === null)
            return;
        if (nodeNext.Next === null)
            return;
        this.EnsureNodeNext(node, index);
        for (let i = 0; ((index === null) || (i < index)) && (i < nodeNext.Next.length); i++) {
            if (node.Context[i] !== nodeNext.Context[i])
                break;
            if (node.Next[i] === null)
                node.Next[i] = nodeNext.Next[i];
            nodeNext.Next[i] = null;
        }
    }
    GetNodeNext(node, index) {
        if (node.Next === null)
            return (null);
        if (node.Next.length <= index)
            return (null);
        return (node.Next[index]);
    }
    ToList(node = null) {
        const list = [];
        const stack = [];
        if (node === null)
            node = this._head;
        while (node != null || stack.length > 0) {
            if (node != null) {
                list.push(node);
                if (node.Next != null) {
                    for (let i = node.Next.length - 1; i >= 0; i--) {
                        const nodeNext = node.Next[i];
                        if (nodeNext !== null)
                            stack.push(nodeNext);
                    }
                }
            }
            node = stack.pop();
        }
        return list;
    }
    ToListValues(node = null) {
        const listValues = [];
        const list = this.ToList(node);
        for (let i = 0; i < list.length; i++)
            listValues.push(list[i].Value);
        return (listValues);
    }
}
//# sourceMappingURL=DrapoLinkedCube.js.map
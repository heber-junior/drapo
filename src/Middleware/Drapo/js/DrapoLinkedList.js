"use strict";
class DrapoLinkedList {
    constructor() {
        this._head = null;
    }
    AddOrUpdate(index, value) {
        if (this._head === null) {
            this._head = new DrapoLinkedListNode();
            this._head.Index = index;
        }
        let node = this._head;
        let isEnd = false;
        while (node.Index !== index) {
            if ((isEnd = (node.Next === null)) || (node.Next.Index > index)) {
                const nodeNew = new DrapoLinkedListNode();
                nodeNew.Index = index;
                if ((isEnd) && (node.Index < index)) {
                    node.Next = nodeNew;
                }
                else if (node === this._head) {
                    nodeNew.Next = node;
                    this._head = nodeNew;
                }
                else {
                    nodeNew.Next = node.Next;
                    node.Next = nodeNew;
                }
                node = nodeNew;
            }
            else {
                node = node.Next;
            }
        }
        node.Value = value;
    }
    Get(index) {
        let node = this._head;
        while (node !== null) {
            if (node.Index < index)
                node = node.Next;
            else if (node.Index === index)
                return (node.Value);
        }
        return (null);
    }
    GetHead() {
        return (this._head);
    }
}
//# sourceMappingURL=DrapoLinkedList.js.map
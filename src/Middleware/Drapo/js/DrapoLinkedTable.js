"use strict";
class DrapoLinkedTable {
    constructor() {
        this._head = null;
    }
    AddOrUpdate(row, column, value) {
        if (this._head === null) {
            this._head = new DrapoLinkedTableNode();
            this._head.Row = row;
            this._head.Column = column;
        }
        let node = this._head;
        let nodeRowPrevious = null;
        let isEnd = false;
        while (node.Row !== row) {
            nodeRowPrevious = node;
            if ((isEnd = (node.NextRow === null)) || (node.NextRow.Row > row)) {
                const nodeRow = new DrapoLinkedTableNode();
                nodeRow.Row = row;
                nodeRow.Column = column;
                if ((isEnd) && (node.Row < row)) {
                    node.NextRow = nodeRow;
                }
                else if (node === this._head) {
                    nodeRow.NextRow = node;
                    this._head = nodeRow;
                }
                else {
                    nodeRow.NextRow = node.NextRow;
                    node.NextRow = nodeRow;
                }
                node = nodeRow;
            }
            else {
                node = node.NextRow;
            }
        }
        const nodeRowHead = node;
        while (node.Column !== column) {
            if ((isEnd = (node.NextCell === null)) || (node.NextCell.Column > column)) {
                const nodeCell = new DrapoLinkedTableNode();
                nodeCell.Row = row;
                nodeCell.Column = column;
                if ((isEnd) && (node.Column < column)) {
                    node.NextCell = nodeCell;
                }
                else if (node === nodeRowHead) {
                    nodeCell.NextCell = node;
                    if (nodeRowHead.Row !== nodeRowPrevious.Row)
                        nodeRowPrevious.NextRow = nodeCell;
                }
                else {
                    nodeCell.NextCell = node.NextCell;
                    node.NextCell = nodeCell;
                }
                node = nodeCell;
            }
            else {
                node = node.NextCell;
            }
        }
        node.Value = value;
    }
    Get(row, column) {
        let node = this._head;
        while (node !== null) {
            if (node.Row < row) {
                node = node.NextRow;
            }
            else if (node.Row > row) {
                return (null);
            }
            else if (node.Row === row) {
                if (node.Column < column)
                    node = node.NextCell;
                else if (node.Column > column)
                    return (null);
                else
                    return (node.Value);
            }
        }
        return (null);
    }
    GetHead() {
        return (this._head);
    }
    Delete(row, column) {
    }
}
//# sourceMappingURL=DrapoLinkedTable.js.map
var lo = Object.defineProperty;
var uo = (e, n, t) => n in e ? lo(e, n, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[n] = t;
var p = (e, n, t) => uo(e, typeof n != "symbol" ? n + "" : n, t);
import { Slice as Z, Fragment as R, DOMSerializer as ln, DOMParser as Be, Node as po } from "prosemirror-model";
import { ReplaceStep as dn, ReplaceAroundStep as rt, Mapping as ho } from "prosemirror-transform";
import { Extension as U, combineTransactionSteps as un, getChangedRanges as fo, findChildrenInRange as mo, Node as oe, Mark as re, isTextSelection as pn, InputRule as le, callOrReturn as go, getExtensionField as bo, mergeAttributes as bt, selectionToInsertionEnd as ko, isNodeSelection as st, posToDOMRect as Ue, getMarkRange as At, findChildren as Nt, findParentNode as wo, extensions as ye, Editor as yo, createDocument as Co, getSchema as vo } from "@tiptap/core";
import { Plugin as I, PluginKey as V, TextSelection as H, NodeSelection as be, Selection as Ve, EditorState as So } from "prosemirror-state";
import { v4 as hn } from "uuid";
import { createHighlightPlugin as Eo } from "prosemirror-highlight";
import { createParser as Bo } from "prosemirror-highlight/shiki";
import xo from "@tiptap/extension-bold";
import Mo from "@tiptap/extension-code";
import To from "@tiptap/extension-italic";
import Po from "@tiptap/extension-strike";
import Io from "@tiptap/extension-underline";
import { TableCell as Lo } from "@tiptap/extension-table-cell";
import { TableHeader as Ao } from "@tiptap/extension-table-header";
import { goToNextCell as Ht, columnResizing as No, tableEditing as Ho, TableView as Do, CellSelection as xe, TableMap as Dt, addRowBefore as Oo, addRowAfter as Ro, addColumnBefore as Vo, addColumnAfter as _o, deleteRow as Uo, deleteColumn as $o, mergeCells as Fo, splitCell as zo } from "prosemirror-tables";
import { Gapcursor as Wo } from "@tiptap/extension-gapcursor";
import { History as jo } from "@tiptap/extension-history";
import { Link as Go } from "@tiptap/extension-link";
import { Text as qo } from "@tiptap/extension-text";
import { yCursorPlugin as Ko, defaultSelectionBuilder as Yo, ySyncPlugin as Jo, yUndoPlugin as Xo, ySyncPluginKey as de, getRelativeSelection as Zo, absolutePositionToRelativePosition as Qo, relativePositionToAbsolutePosition as er, yUndoPluginKey as Ae, yCursorPluginKey as tr, undoCommand as nr, redoCommand as or } from "y-prosemirror";
import { DecorationSet as q, Decoration as Q, EditorView as rr } from "prosemirror-view";
import * as ie from "yjs";
import { undo as sr, redo as ir } from "prosemirror-history";
import { dropCursor as ar } from "prosemirror-dropcursor";
import { e as cr } from "./en-Dx9fwHD4.js";
function lr(e, n = JSON.stringify) {
  const t = {};
  return e.filter((o) => {
    const r = n(o);
    return Object.prototype.hasOwnProperty.call(t, r) ? !1 : t[r] = !0;
  });
}
function dr(e) {
  const n = e.filter(
    (o, r) => e.indexOf(o) !== r
  );
  return lr(n);
}
const je = U.create({
  name: "uniqueID",
  // we’ll set a very high priority to make sure this runs first
  // and is compatible with `appendTransaction` hooks of other extensions
  priority: 1e4,
  addOptions() {
    return {
      attributeName: "id",
      types: [],
      setIdAttribute: !1,
      generateID: () => {
        if (typeof window < "u" && window.__TEST_OPTIONS) {
          const e = window.__TEST_OPTIONS;
          return e.mockID === void 0 ? e.mockID = 0 : e.mockID++, e.mockID.toString();
        }
        return hn();
      },
      filterTransaction: null
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          [this.options.attributeName]: {
            default: null,
            parseHTML: (e) => e.getAttribute(`data-${this.options.attributeName}`),
            renderHTML: (e) => {
              const n = {
                [`data-${this.options.attributeName}`]: e[this.options.attributeName]
              };
              return this.options.setIdAttribute ? {
                ...n,
                id: e[this.options.attributeName]
              } : n;
            }
          }
        }
      }
    ];
  },
  // check initial content for missing ids
  // onCreate() {
  //   // Don’t do this when the collaboration extension is active
  //   // because this may update the content, so Y.js tries to merge these changes.
  //   // This leads to empty block nodes.
  //   // See: https://github.com/ueberdosis/tiptap/issues/2400
  //   if (
  //     this.editor.extensionManager.extensions.find(
  //       (extension) => extension.name === "collaboration"
  //     )
  //   ) {
  //     return;
  //   }
  //   const { view, state } = this.editor;
  //   const { tr, doc } = state;
  //   const { types, attributeName, generateID } = this.options;
  //   const nodesWithoutId = findChildren(doc, (node) => {
  //     return (
  //       types.includes(node.type.name) && node.attrs[attributeName] === null
  //     );
  //   });
  //   nodesWithoutId.forEach(({ node, pos }) => {
  //     tr.setNodeMarkup(pos, undefined, {
  //       ...node.attrs,
  //       [attributeName]: generateID(),
  //     });
  //   });
  //   tr.setMeta("addToHistory", false);
  //   view.dispatch(tr);
  // },
  addProseMirrorPlugins() {
    let e = null, n = !1;
    return [
      new I({
        key: new V("uniqueID"),
        appendTransaction: (t, o, r) => {
          const s = t.some((m) => m.docChanged) && !o.doc.eq(r.doc), i = this.options.filterTransaction && t.some((m) => {
            let g, b;
            return !(!((b = (g = this.options).filterTransaction) === null || b === void 0) && b.call(g, m));
          });
          if (!s || i)
            return;
          const { tr: a } = r, { types: c, attributeName: l, generateID: d } = this.options, u = un(
            o.doc,
            t
          ), { mapping: h } = u;
          if (fo(u).forEach(({ newRange: m }) => {
            const g = mo(
              r.doc,
              m,
              (w) => c.includes(w.type.name)
            ), b = g.map(({ node: w }) => w.attrs[l]).filter((w) => w !== null), k = dr(b);
            g.forEach(({ node: w, pos: y }) => {
              let v;
              const N = (v = a.doc.nodeAt(y)) === null || v === void 0 ? void 0 : v.attrs[l];
              if (N === null) {
                const S = o.doc.type.createAndFill().content;
                if (o.doc.content.findDiffStart(S) === null) {
                  const x = JSON.parse(
                    JSON.stringify(r.doc.toJSON())
                  );
                  if (x.content[0].content[0].attrs.id = "initialBlockId", JSON.stringify(x.content) === JSON.stringify(S.toJSON())) {
                    a.setNodeMarkup(y, void 0, {
                      ...w.attrs,
                      [l]: "initialBlockId"
                    });
                    return;
                  }
                }
                a.setNodeMarkup(y, void 0, {
                  ...w.attrs,
                  [l]: d()
                });
                return;
              }
              const { deleted: z } = h.invert().mapResult(y);
              z && k.includes(N) && a.setNodeMarkup(y, void 0, {
                ...w.attrs,
                [l]: d()
              });
            });
          }), !!a.steps.length)
            return a;
        },
        // we register a global drag handler to track the current drag source element
        view(t) {
          const o = (r) => {
            let s;
            e = !((s = t.dom.parentElement) === null || s === void 0) && s.contains(r.target) ? t.dom.parentElement : null;
          };
          return window.addEventListener("dragstart", o), {
            destroy() {
              window.removeEventListener("dragstart", o);
            }
          };
        },
        props: {
          // `handleDOMEvents` is called before `transformPasted` so we can do
          // some checks before. However, `transformPasted` only runs when
          // editor content is pasted - not external content.
          handleDOMEvents: {
            // only create new ids for dropped content while holding `alt`
            // or content is dragged from another editor
            drop: (t, o) => {
              let r;
              return e !== t.dom.parentElement || ((r = o.dataTransfer) === null || r === void 0 ? void 0 : r.effectAllowed) === "copy" ? n = !0 : n = !1, e = null, !1;
            },
            // always create new ids on pasted content
            paste: () => (n = !0, !1)
          },
          // we’ll remove ids for every pasted node
          // so we can create a new one within `appendTransaction`
          transformPasted: (t) => {
            if (!n)
              return t;
            const { types: o, attributeName: r } = this.options, s = (i) => {
              const a = [];
              return i.forEach((c) => {
                if (c.isText) {
                  a.push(c);
                  return;
                }
                if (!o.includes(c.type.name)) {
                  a.push(c.copy(s(c.content)));
                  return;
                }
                const l = c.type.create(
                  {
                    ...c.attrs,
                    [r]: null
                  },
                  s(c.content),
                  c.marks
                );
                a.push(l);
              }), R.from(a);
            };
            return n = !1, new Z(
              s(t.content),
              t.openStart,
              t.openEnd
            );
          }
        }
      })
    ];
  }
});
function Ot(e) {
  return e.type === "link";
}
function fn(e) {
  return typeof e != "string" && e.type === "link";
}
function ue(e) {
  return typeof e != "string" && e.type === "text";
}
function it(e) {
  var n, t, o, r, s;
  return kt(e) ? { ...e } : ve(e) ? {
    type: "tableCell",
    content: [].concat(e.content),
    props: {
      backgroundColor: ((n = e.props) == null ? void 0 : n.backgroundColor) ?? "default",
      textColor: ((t = e.props) == null ? void 0 : t.textColor) ?? "default",
      textAlignment: ((o = e.props) == null ? void 0 : o.textAlignment) ?? "left",
      colspan: ((r = e.props) == null ? void 0 : r.colspan) ?? 1,
      rowspan: ((s = e.props) == null ? void 0 : s.rowspan) ?? 1
    }
  } : {
    type: "tableCell",
    content: [].concat(e),
    props: {
      backgroundColor: "default",
      textColor: "default",
      textAlignment: "left",
      colspan: 1,
      rowspan: 1
    }
  };
}
function ve(e) {
  return e != null && typeof e != "string" && !Array.isArray(e) && e.type === "tableCell";
}
function kt(e) {
  return ve(e) && e.props !== void 0 && e.content !== void 0;
}
function Se(e) {
  return kt(e) ? e.props.colspan ?? 1 : 1;
}
function at(e) {
  return kt(e) ? e.props.rowspan ?? 1 : 1;
}
class K extends Error {
  constructor(n) {
    super(`Unreachable case: ${n}`);
  }
}
function zc(e, n = !0) {
  const { "data-test": t, ...o } = e;
  if (Object.keys(o).length > 0 && n)
    throw new Error("Object must be empty " + JSON.stringify(e));
}
const ur = () => typeof navigator < "u" && (/Mac/.test(navigator.platform) || /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent));
function X(e, n = "Ctrl") {
  return ur() ? e.replace("Mod", "⌘") : e.replace("Mod", n);
}
function ne(...e) {
  return [
    // Converts to & from set to remove duplicates.
    ...new Set(
      e.filter((n) => n).join(" ").split(" ")
    )
  ].join(" ");
}
const Wc = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
function $(e, n, t, o) {
  const r = document.createElement("div");
  r.className = ne(
    "bn-block-content",
    t.class
  ), r.setAttribute("data-content-type", e);
  for (const [i, a] of Object.entries(t))
    i !== "class" && r.setAttribute(i, a);
  const s = document.createElement(n);
  s.className = ne(
    "bn-inline-content",
    o.class
  );
  for (const [i, a] of Object.entries(
    o
  ))
    i !== "class" && s.setAttribute(i, a);
  return r.appendChild(s), {
    dom: r,
    contentDOM: s
  };
}
const Rt = (e, n) => {
  let t = he(e, n.pmSchema);
  t.type.name === "blockContainer" && (t = t.firstChild);
  const o = n.pmSchema.nodes[t.type.name].spec.toDOM;
  if (o === void 0)
    throw new Error(
      "This block has no default HTML serialization as its corresponding TipTap node doesn't implement `renderHTML`."
    );
  const r = o(t);
  if (typeof r != "object" || !("dom" in r))
    throw new Error(
      "Cannot use this block's default HTML serialization as its corresponding TipTap node's `renderHTML` function does not return an object with the `dom` property."
    );
  return r;
};
function pr(e) {
  const n = e.querySelectorAll("p");
  if (n.length > 1) {
    const t = n[0];
    for (let o = 1; o < n.length; o++) {
      const r = n[o];
      t.innerHTML += "<br>" + r.innerHTML, r.remove();
    }
  }
}
const M = {
  backgroundColor: {
    default: "default"
  },
  textColor: {
    default: "default"
  },
  textAlignment: {
    default: "left",
    values: ["left", "center", "right", "justify"]
  }
}, mn = ["backgroundColor", "textColor"];
function $e(e) {
  return "data-" + e.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function jc(e) {
  const n = e.split("/");
  return !n.length || // invalid?
  n[n.length - 1] === "" ? e : n[n.length - 1];
}
function ke(e) {
  const n = {};
  return Object.entries(e).filter(([t, o]) => !mn.includes(t)).forEach(([t, o]) => {
    n[t] = {
      default: o.default,
      keepOnSplit: !0,
      // Props are displayed in kebab-case as HTML attributes. If a prop's
      // value is the same as its default, we don't display an HTML
      // attribute for it.
      parseHTML: (r) => {
        const s = r.getAttribute($e(t));
        if (s === null)
          return null;
        if (o.default === void 0 && o.type === "boolean" || o.default !== void 0 && typeof o.default == "boolean")
          return s === "true" ? !0 : s === "false" ? !1 : null;
        if (o.default === void 0 && o.type === "number" || o.default !== void 0 && typeof o.default == "number") {
          const i = parseFloat(s);
          return !Number.isNaN(i) && Number.isFinite(i) ? i : null;
        }
        return s;
      },
      renderHTML: (r) => r[t] !== o.default ? {
        [$e(t)]: r[t]
      } : {}
    };
  }), n;
}
function wt(e, n, t, o) {
  if (typeof e == "boolean")
    throw new Error(
      "Cannot find node position as getPos is a boolean, not a function."
    );
  const r = e(), i = t.state.doc.resolve(r).node().attrs.id;
  if (!i)
    throw new Error("Block doesn't have id");
  const a = n.getBlock(i);
  if (a.type !== o)
    throw new Error("Block type does not match");
  return a;
}
function Ne(e, n, t, o, r = !1, s) {
  const i = document.createElement("div");
  if (s !== void 0)
    for (const [a, c] of Object.entries(s))
      a !== "class" && i.setAttribute(a, c);
  i.className = ne(
    "bn-block-content",
    (s == null ? void 0 : s.class) || ""
  ), i.setAttribute("data-content-type", n);
  for (const [a, c] of Object.entries(t)) {
    const d = o[a].default;
    !mn.includes(a) && c !== d && i.setAttribute($e(a), c);
  }
  return r && i.setAttribute("data-file-block", ""), i.appendChild(e.dom), e.contentDOM !== void 0 && (e.contentDOM.className = ne(
    "bn-inline-content",
    e.contentDOM.className
  )), {
    ...e,
    dom: i
  };
}
function j(e) {
  return oe.create(e);
}
function gn(e, n) {
  return {
    config: e,
    implementation: n
  };
}
function J(e, n, t) {
  return gn(
    {
      type: e.name,
      content: e.config.content === "inline*" ? "inline" : e.config.content === "tableRow+" ? "table" : "none",
      propSchema: n
    },
    {
      node: e,
      requiredExtensions: t,
      toInternalHTML: Rt,
      toExternalHTML: Rt
      // parse: () => undefined, // parse rules are in node already
    }
  );
}
function bn(e) {
  return Object.fromEntries(
    Object.entries(e).map(([n, t]) => [n, t.config])
  );
}
function hr(e, n) {
  e.stopEvent = (t) => (t.type === "mousedown" && setTimeout(() => {
    n.view.dom.blur();
  }, 10), !0);
}
function fr(e, n) {
  const t = [
    {
      tag: "[data-content-type=" + e.type + "]",
      contentElement: ".bn-inline-content"
    }
  ];
  return n && t.push({
    tag: "*",
    getAttrs(o) {
      if (typeof o == "string")
        return !1;
      const r = n == null ? void 0 : n(o);
      return r === void 0 ? !1 : r;
    }
  }), t;
}
function Me(e, n) {
  const t = j({
    name: e.type,
    content: e.content === "inline" ? "inline*" : "",
    group: "blockContent",
    selectable: e.isSelectable ?? !0,
    isolating: !0,
    addAttributes() {
      return ke(e.propSchema);
    },
    parseHTML() {
      return fr(e, n.parse);
    },
    renderHTML({ HTMLAttributes: o }) {
      const r = document.createElement("div");
      return Ne(
        {
          dom: r,
          contentDOM: e.content === "inline" ? r : void 0
        },
        e.type,
        {},
        e.propSchema,
        e.isFileBlock,
        o
      );
    },
    addNodeView() {
      return ({ getPos: o }) => {
        var l;
        const r = this.options.editor, s = wt(
          o,
          r,
          this.editor,
          e.type
        ), i = ((l = this.options.domAttributes) == null ? void 0 : l.blockContent) || {}, a = n.render(s, r), c = Ne(
          a,
          s.type,
          s.props,
          e.propSchema,
          e.isFileBlock,
          i
        );
        return e.isSelectable === !1 && hr(c, this.editor), c;
      };
    }
  });
  if (t.name !== e.type)
    throw new Error(
      "Node name does not match block type. This is a bug in BlockNote."
    );
  return gn(e, {
    node: t,
    toInternalHTML: (o, r) => {
      var a;
      const s = ((a = t.options.domAttributes) == null ? void 0 : a.blockContent) || {}, i = n.render(o, r);
      return Ne(
        i,
        o.type,
        o.props,
        e.propSchema,
        e.isFileBlock,
        s
      );
    },
    // TODO: this should not have wrapInBlockStructure and generally be a lot simpler
    // post-processing in externalHTMLExporter should not be necessary
    toExternalHTML: (o, r) => {
      var a, c;
      const s = ((a = t.options.domAttributes) == null ? void 0 : a.blockContent) || {};
      let i = (c = n.toExternalHTML) == null ? void 0 : c.call(
        n,
        o,
        r
      );
      return i === void 0 && (i = n.render(o, r)), Ne(
        i,
        o.type,
        o.props,
        e.propSchema,
        s
      );
    }
  });
}
function ee(e, n) {
  const t = e.resolve(n);
  if (t.nodeAfter && t.nodeAfter.type.isInGroup("bnBlock"))
    return {
      posBeforeNode: t.pos,
      node: t.nodeAfter
    };
  let o = t.depth, r = t.node(o);
  for (; o > 0; ) {
    if (r.type.isInGroup("bnBlock"))
      return {
        posBeforeNode: t.before(o),
        node: r
      };
    o--, r = t.node(o);
  }
  const s = [];
  e.descendants((a, c) => {
    a.type.isInGroup("bnBlock") && s.push(c);
  }), console.warn(`Position ${n} is not within a blockContainer node.`);
  const i = e.resolve(
    s.find((a) => a >= n) || s[s.length - 1]
  );
  return {
    posBeforeNode: i.pos,
    node: i.nodeAfter
  };
}
function yt(e, n) {
  if (!e.type.isInGroup("bnBlock"))
    throw new Error(
      `Attempted to get bnBlock node at position but found node of different type ${e.type.name}`
    );
  const t = e, o = n, r = o + t.nodeSize, s = {
    node: t,
    beforePos: o,
    afterPos: r
  };
  if (t.type.name === "blockContainer") {
    let i, a;
    if (t.forEach((c, l) => {
      if (c.type.spec.group === "blockContent") {
        const d = c, u = o + l + 1, h = u + c.nodeSize;
        i = {
          node: d,
          beforePos: u,
          afterPos: h
        };
      } else if (c.type.name === "blockGroup") {
        const d = c, u = o + l + 1, h = u + c.nodeSize;
        a = {
          node: d,
          beforePos: u,
          afterPos: h
        };
      }
    }), !i)
      throw new Error(
        `blockContainer node does not contain a blockContent node in its children: ${t}`
      );
    return {
      isBlockContainer: !0,
      bnBlock: s,
      blockContent: i,
      childContainer: a,
      blockNoteType: i.node.type.name
    };
  } else {
    if (!s.node.type.isInGroup("childContainer"))
      throw new Error(
        `bnBlock node is not in the childContainer group: ${s.node}`
      );
    return {
      isBlockContainer: !1,
      bnBlock: s,
      childContainer: s,
      blockNoteType: s.node.type.name
    };
  }
}
function Y(e) {
  return yt(e.node, e.posBeforeNode);
}
function Te(e) {
  if (!e.nodeAfter)
    throw new Error(
      `Attempted to get blockContainer node at position ${e.pos} but a node at this position does not exist`
    );
  return yt(e.nodeAfter, e.pos);
}
function C(e) {
  const n = ee(e.doc, e.selection.anchor);
  return Y(n);
}
function Ge(e) {
  const n = ee(e.doc, e.selection.anchor);
  return Y(n);
}
function A(e) {
  return "doc" in e ? e.doc.type.schema : e.type.schema;
}
function kn(e) {
  return e.cached.blockNoteEditor;
}
function Pe(e) {
  return kn(e).schema;
}
function Ct(e) {
  return Pe(e).blockSchema;
}
function vt(e) {
  return Pe(e).inlineContentSchema;
}
function we(e) {
  return Pe(e).styleSchema;
}
function St(e) {
  return kn(e).blockCache;
}
function wn(e, n, t) {
  var s, i;
  const o = {
    type: "tableContent",
    columnWidths: [],
    headerRows: void 0,
    headerCols: void 0,
    rows: []
  }, r = [];
  e.content.forEach((a, c, l) => {
    const d = {
      cells: []
    };
    l === 0 && a.content.forEach((u) => {
      let h = u.attrs.colwidth;
      h == null && (h = new Array(u.attrs.colspan ?? 1).fill(void 0)), o.columnWidths.push(...h);
    }), d.cells = a.content.content.map((u, h) => (r[l] || (r[l] = []), r[l][h] = u.type.name === "tableHeader", {
      type: "tableCell",
      content: u.content.content.map(
        (m) => qe(m, n, t)
      ).reduce(
        (m, g) => {
          if (!m.length)
            return g;
          const b = m[m.length - 1], k = g[0];
          return k && ue(b) && ue(k) && JSON.stringify(b.styles) === JSON.stringify(k.styles) ? (b.text += `
` + k.text, m.push(...g.slice(1)), m) : (m.push(...g), m);
        },
        []
      ),
      props: {
        colspan: u.attrs.colspan,
        rowspan: u.attrs.rowspan,
        backgroundColor: u.attrs.backgroundColor,
        textColor: u.attrs.textColor,
        textAlignment: u.attrs.textAlignment
      }
    })), o.rows.push(d);
  });
  for (let a = 0; a < r.length; a++)
    (s = r[a]) != null && s.every((c) => c) && (o.headerRows = (o.headerRows ?? 0) + 1);
  for (let a = 0; a < ((i = r[0]) == null ? void 0 : i.length); a++)
    r != null && r.every((c) => c[a]) && (o.headerCols = (o.headerCols ?? 0) + 1);
  return o;
}
function qe(e, n, t) {
  const o = [];
  let r;
  return e.content.forEach((s) => {
    if (s.type.name === "hardBreak") {
      if (r)
        if (ue(r))
          r.text += `
`;
        else if (Ot(r))
          r.content[r.content.length - 1].text += `
`;
        else
          throw new Error("unexpected");
      else
        r = {
          type: "text",
          text: `
`,
          styles: {}
        };
      return;
    }
    if (s.type.name !== "link" && s.type.name !== "text") {
      if (!n[s.type.name]) {
        console.warn("unrecognized inline content type", s.type.name);
        return;
      }
      r && (o.push(r), r = void 0), o.push(
        ct(s, n, t)
      );
      return;
    }
    const i = {};
    let a;
    for (const c of s.marks)
      if (c.type.name === "link")
        a = c;
      else {
        const l = t[c.type.name];
        if (!l) {
          if (c.type.spec.blocknoteIgnore)
            continue;
          throw new Error(`style ${c.type.name} not found in styleSchema`);
        }
        if (l.propSchema === "boolean")
          i[l.type] = !0;
        else if (l.propSchema === "string")
          i[l.type] = c.attrs.stringValue;
        else
          throw new K(l.propSchema);
      }
    r ? ue(r) ? a ? (o.push(r), r = {
      type: "link",
      href: a.attrs.href,
      content: [
        {
          type: "text",
          text: s.textContent,
          styles: i
        }
      ]
    }) : JSON.stringify(r.styles) === JSON.stringify(i) ? r.text += s.textContent : (o.push(r), r = {
      type: "text",
      text: s.textContent,
      styles: i
    }) : Ot(r) && (a ? r.href === a.attrs.href ? JSON.stringify(
      r.content[r.content.length - 1].styles
    ) === JSON.stringify(i) ? r.content[r.content.length - 1].text += s.textContent : r.content.push({
      type: "text",
      text: s.textContent,
      styles: i
    }) : (o.push(r), r = {
      type: "link",
      href: a.attrs.href,
      content: [
        {
          type: "text",
          text: s.textContent,
          styles: i
        }
      ]
    }) : (o.push(r), r = {
      type: "text",
      text: s.textContent,
      styles: i
    })) : a ? r = {
      type: "link",
      href: a.attrs.href,
      content: [
        {
          type: "text",
          text: s.textContent,
          styles: i
        }
      ]
    } : r = {
      type: "text",
      text: s.textContent,
      styles: i
    };
  }), r && o.push(r), o;
}
function ct(e, n, t) {
  if (e.type.name === "text" || e.type.name === "link")
    throw new Error("unexpected");
  const o = {}, r = n[e.type.name];
  for (const [a, c] of Object.entries(e.attrs)) {
    if (!r)
      throw Error("ic node is of an unrecognized type: " + e.type.name);
    const l = r.propSchema;
    a in l && (o[a] = c);
  }
  let s;
  return r.content === "styled" ? s = qe(
    e,
    n,
    t
  ) : s = void 0, {
    type: e.type.name,
    props: o,
    content: s
  };
}
function E(e, n, t = Ct(n), o = vt(n), r = we(n), s = St(n)) {
  var g;
  if (!e.type.isInGroup("bnBlock"))
    throw Error("Node should be a bnBlock, but is instead: " + e.type.name);
  const i = s == null ? void 0 : s.get(e);
  if (i)
    return i;
  const a = yt(e, 0);
  let c = a.bnBlock.node.attrs.id;
  c === null && (c = je.options.generateID());
  const l = t[a.blockNoteType];
  if (!l)
    throw Error("Block is of an unrecognized type: " + a.blockNoteType);
  const d = {};
  for (const [b, k] of Object.entries({
    ...e.attrs,
    ...a.isBlockContainer ? a.blockContent.node.attrs : {}
  })) {
    const w = l.propSchema;
    b in w && !(w[b].default === void 0 && k === void 0) && (d[b] = k);
  }
  const u = t[a.blockNoteType], h = [];
  (g = a.childContainer) == null || g.node.forEach((b) => {
    h.push(
      E(
        b,
        n,
        t,
        o,
        r,
        s
      )
    );
  });
  let f;
  if (u.content === "inline") {
    if (!a.isBlockContainer)
      throw new Error("impossible");
    f = qe(
      a.blockContent.node,
      o,
      r
    );
  } else if (u.content === "table") {
    if (!a.isBlockContainer)
      throw new Error("impossible");
    f = wn(
      a.blockContent.node,
      o,
      r
    );
  } else if (u.content === "none")
    f = void 0;
  else
    throw new K(u.content);
  const m = {
    id: c,
    type: u.type,
    props: d,
    content: f,
    children: h
  };
  return s == null || s.set(e, m), m;
}
function mr(e, n, t = Ct(n), o = vt(n), r = we(n), s = St(n)) {
  const i = [];
  return e.firstChild.descendants((a) => (i.push(
    E(
      a,
      n,
      t,
      o,
      r,
      s
    )
  ), !1)), i;
}
function gr(e, n, t = Ct(n), o = vt(n), r = we(n), s = St(n)) {
  function i(a, c, l) {
    if (a.type.name !== "blockGroup")
      throw new Error("unexpected");
    const d = [];
    let u, h;
    return a.forEach((f, m, g) => {
      if (f.type.name !== "blockContainer")
        throw new Error("unexpected");
      if (f.childCount === 0)
        return;
      if (f.childCount === 0 || f.childCount > 2)
        throw new Error(
          "unexpected, blockContainer.childCount: " + f.childCount
        );
      const b = g === 0, k = g === a.childCount - 1;
      if (f.firstChild.type.name === "blockGroup") {
        if (!b)
          throw new Error("unexpected");
        const N = i(
          f.firstChild,
          Math.max(0, c - 1),
          k ? Math.max(0, l - 1) : 0
        );
        u = N.blockCutAtStart, k && (h = N.blockCutAtEnd), d.push(...N.blocks);
        return;
      }
      const w = E(
        f,
        n,
        t,
        o,
        r,
        s
      ), y = f.childCount > 1 ? f.child(1) : void 0;
      let v = [];
      if (y) {
        const N = i(
          y,
          0,
          // TODO: can this be anything other than 0?
          k ? Math.max(0, l - 1) : 0
        );
        v = N.blocks, k && (h = N.blockCutAtEnd);
      }
      k && !y && l > 1 && (h = w.id), b && c > 1 && (u = w.id), d.push({
        ...w,
        children: v
      });
    }), { blocks: d, blockCutAtStart: u, blockCutAtEnd: h };
  }
  if (e.content.childCount === 0)
    return {
      blocks: [],
      blockCutAtStart: void 0,
      blockCutAtEnd: void 0
    };
  if (e.content.childCount !== 1)
    throw new Error(
      "slice must be a single block, did you forget includeParents=true?"
    );
  return i(
    e.content.firstChild,
    Math.max(e.openStart - 1, 0),
    Math.max(e.openEnd - 1, 0)
  );
}
function Vt(e, n, t, o) {
  return e.dom.setAttribute("data-inline-content-type", n), Object.entries(t).filter(([r, s]) => {
    const i = o[r];
    return s !== i.default;
  }).map(([r, s]) => [$e(r), s]).forEach(([r, s]) => e.dom.setAttribute(r, s)), e.contentDOM !== void 0 && e.contentDOM.setAttribute("data-editable", ""), e;
}
function br(e) {
  return {
    Backspace: ({ editor: n }) => {
      const t = n.state.selection.$from;
      return n.state.selection.empty && t.node().type.name === e.type && t.parentOffset === 0;
    }
  };
}
function kr(e, n) {
  return {
    config: e,
    implementation: n
  };
}
function wr(e, n) {
  return kr(
    {
      type: e.name,
      propSchema: n,
      content: e.config.content === "inline*" ? "styled" : "none"
    },
    {
      node: e
    }
  );
}
function yn(e) {
  return Object.fromEntries(
    Object.entries(e).map(([n, t]) => [n, t.config])
  );
}
function yr(e) {
  return [
    {
      tag: `[data-inline-content-type="${e.type}"]`,
      contentElement: (n) => {
        const t = n;
        return t.matches("[data-editable]") ? t : t.querySelector("[data-editable]") || t;
      }
    }
  ];
}
function Gc(e, n) {
  const t = oe.create({
    name: e.type,
    inline: !0,
    group: "inline",
    selectable: e.content === "styled",
    atom: e.content === "none",
    content: e.content === "styled" ? "inline*" : "",
    addAttributes() {
      return ke(e.propSchema);
    },
    addKeyboardShortcuts() {
      return br(e);
    },
    parseHTML() {
      return yr(e);
    },
    renderHTML({ node: o }) {
      const r = this.options.editor, s = n.render(
        ct(
          o,
          r.schema.inlineContentSchema,
          r.schema.styleSchema
        ),
        // TODO: fix cast
        () => {
        },
        r
      );
      return Vt(
        s,
        e.type,
        o.attrs,
        e.propSchema
      );
    },
    addNodeView() {
      return ({ node: o, getPos: r }) => {
        const s = this.options.editor, i = n.render(
          ct(
            o,
            s.schema.inlineContentSchema,
            s.schema.styleSchema
          ),
          // TODO: fix cast
          (a) => {
            if (typeof r == "boolean")
              return;
            const c = W([a], s.pmSchema);
            s.transact(
              (l) => l.replaceWith(r(), r() + o.nodeSize, c)
            );
          },
          s
        );
        return Vt(
          i,
          e.type,
          o.attrs,
          e.propSchema
        );
      };
    }
  });
  return wr(
    t,
    e.propSchema
  );
}
function Cr(e) {
  return e === "boolean" ? {} : {
    stringValue: {
      default: void 0,
      keepOnSplit: !0,
      parseHTML: (n) => n.getAttribute("data-value"),
      renderHTML: (n) => n.stringValue !== void 0 ? {
        "data-value": n.stringValue
      } : {}
    }
  };
}
function vr(e, n, t, o) {
  return e.dom.setAttribute("data-style-type", n), o === "string" && e.dom.setAttribute("data-value", t), e.contentDOM !== void 0 && e.contentDOM.setAttribute("data-editable", ""), e;
}
function Cn(e, n) {
  return {
    config: e,
    implementation: n
  };
}
function ae(e, n) {
  return Cn(
    {
      type: e.name,
      propSchema: n
    },
    {
      mark: e
    }
  );
}
function vn(e) {
  return Object.fromEntries(
    Object.entries(e).map(([n, t]) => [n, t.config])
  );
}
function Sr(e) {
  return [
    {
      tag: `[data-style-type="${e.type}"]`,
      contentElement: (n) => {
        const t = n;
        return t.matches("[data-editable]") ? t : t.querySelector("[data-editable]") || t;
      }
    }
  ];
}
function qc(e, n) {
  const t = re.create({
    name: e.type,
    addAttributes() {
      return Cr(e.propSchema);
    },
    parseHTML() {
      return Sr(e);
    },
    renderHTML({ mark: o }) {
      let r;
      if (e.propSchema === "boolean")
        r = n.render();
      else if (e.propSchema === "string")
        r = n.render(o.attrs.stringValue);
      else
        throw new K(e.propSchema);
      return vr(
        r,
        e.type,
        o.attrs.stringValue,
        e.propSchema
      );
    }
  });
  return Cn(e, {
    mark: t
  });
}
function se(e) {
  const { height: n, width: t } = Et(e), o = new Array(n).fill(!1).map(() => new Array(t).fill(null)), r = (s, i) => {
    for (let a = s; a < n; a++)
      for (let c = i; c < t; c++)
        if (!o[a][c])
          return { row: a, col: c };
    throw new Error(
      "Unable to create occupancy grid for table, no more available cells"
    );
  };
  for (let s = 0; s < e.content.rows.length; s++)
    for (let i = 0; i < e.content.rows[s].cells.length; i++) {
      const a = it(e.content.rows[s].cells[i]), c = at(a), l = Se(a), { row: d, col: u } = r(s, i);
      for (let h = d; h < d + c; h++)
        for (let f = u; f < u + l; f++) {
          if (o[h][f])
            throw new Error(
              `Unable to create occupancy grid for table, cell at ${h},${f} is already occupied`
            );
          o[h][f] = {
            row: s,
            col: i,
            rowspan: c,
            colspan: l,
            cell: a
          };
        }
    }
  return o;
}
function Ee(e) {
  const n = /* @__PURE__ */ new Set();
  return e.map((t) => ({
    cells: t.map((o) => n.has(o.row + ":" + o.col) ? !1 : (n.add(o.row + ":" + o.col), o.cell)).filter((o) => o !== !1)
  }));
}
function pe(e, n, t = se(n)) {
  for (let o = 0; o < t.length; o++)
    for (let r = 0; r < t[o].length; r++) {
      const s = t[o][r];
      if (s.row === e.row && s.col === e.col)
        return { row: o, col: r, cell: s.cell };
    }
  throw new Error(
    `Unable to resolve relative table cell indices for table, cell at ${e.row},${e.col} is not occupied`
  );
}
function Et(e) {
  const n = e.content.rows.length;
  let t = 0;
  return e.content.rows.forEach((o) => {
    let r = 0;
    o.cells.forEach((s) => {
      r += Se(s);
    }), t = Math.max(t, r);
  }), { height: n, width: t };
}
function Sn(e, n, t = se(n)) {
  var r;
  const o = (r = t[e.row]) == null ? void 0 : r[e.col];
  if (o)
    return {
      row: o.row,
      col: o.col,
      cell: o.cell
    };
}
function lt(e, n) {
  var s;
  const t = se(e);
  if (n < 0 || n >= t.length)
    return [];
  let o = 0;
  for (let i = 0; i < n; i++) {
    const a = (s = t[o]) == null ? void 0 : s[0];
    if (!a)
      return [];
    o += a.rowspan;
  }
  const r = new Array(t[0].length).fill(!1).map((i, a) => Sn(
    { row: o, col: a },
    e,
    t
  )).filter(
    (i) => i !== void 0
  );
  return r.filter((i, a) => r.findIndex((c) => c.row === i.row && c.col === i.col) === a);
}
function dt(e, n) {
  var s;
  const t = se(e);
  if (n < 0 || n >= t[0].length)
    return [];
  let o = 0;
  for (let i = 0; i < n; i++) {
    const a = (s = t[0]) == null ? void 0 : s[o];
    if (!a)
      return [];
    o += a.colspan;
  }
  const r = new Array(t.length).fill(!1).map((i, a) => Sn(
    { row: a, col: o },
    e,
    t
  )).filter(
    (i) => i !== void 0
  );
  return r.filter((i, a) => r.findIndex((c) => c.row === i.row && c.col === i.col) === a);
}
function Er(e, n, t, o = se(e)) {
  const { col: r } = pe(
    {
      row: 0,
      col: n
    },
    e,
    o
  ), { col: s } = pe(
    {
      row: 0,
      col: t
    },
    e,
    o
  );
  return o.forEach((i) => {
    const [a] = i.splice(r, 1);
    i.splice(s, 0, a);
  }), Ee(o);
}
function Br(e, n, t, o = se(e)) {
  const { row: r } = pe(
    {
      row: n,
      col: 0
    },
    e,
    o
  ), { row: s } = pe(
    {
      row: t,
      col: 0
    },
    e,
    o
  ), [i] = o.splice(r, 1);
  return o.splice(s, 0, i), Ee(o);
}
function ut(e) {
  return e ? ve(e) ? ut(e.content) : typeof e == "string" ? e.length === 0 : Array.isArray(e) ? e.every(
    (n) => typeof n == "string" ? n.length === 0 : ue(n) ? n.text.length === 0 : fn(n) ? typeof n.content == "string" ? n.content.length === 0 : n.content.every((t) => t.text.length === 0) : !1
  ) : !1 : !0;
}
function xr(e, n, t = se(e)) {
  if (n === "columns") {
    let s = 0;
    for (let i = t[0].length - 1; i >= 0 && t.every(
      (c) => ut(c[i].cell) && c[i].colspan === 1
    ); i--)
      s++;
    for (let i = t.length - 1; i >= 0; i--) {
      const a = Math.max(
        t[i].length - s,
        1
      );
      t[i] = t[i].slice(0, a);
    }
    return Ee(t);
  }
  let o = 0;
  for (let s = t.length - 1; s >= 0 && t[s].every(
    (a) => ut(a.cell) && a.rowspan === 1
  ); s--)
    o++;
  const r = Math.min(o, t.length - 1);
  return t.splice(t.length - r, r), Ee(t);
}
function Mr(e, n, t, o = se(e)) {
  const { width: r, height: s } = Et(e);
  if (n === "columns")
    o.forEach((i, a) => {
      if (t >= 0)
        for (let c = 0; c < t; c++)
          i.push({
            row: a,
            col: Math.max(...i.map((l) => l.col)) + 1,
            rowspan: 1,
            colspan: 1,
            cell: it("")
          });
      else
        i.splice(r + t, -1 * t);
    });
  else if (t > 0)
    for (let i = 0; i < t; i++) {
      const a = new Array(r).fill(null).map((c, l) => ({
        row: s + i,
        col: l,
        rowspan: 1,
        colspan: 1,
        cell: it("")
      }));
      o.push(a);
    }
  else t < 0 && o.splice(s + t, -1 * t);
  return Ee(o);
}
function En(e, n, t) {
  const o = lt(e, t);
  if (!o.some((c) => at(c.cell) > 1))
    return !0;
  let s = t, i = t;
  return o.forEach((c) => {
    const l = at(c.cell);
    s = Math.max(s, c.row + l - 1), i = Math.min(i, c.row);
  }), n < t ? t === s : t === i;
}
function Bn(e, n, t) {
  const o = dt(e, t);
  if (!o.some((c) => Se(c.cell) > 1))
    return !0;
  let s = t, i = t;
  return o.forEach((c) => {
    const l = Se(c.cell);
    s = Math.max(s, c.col + l - 1), i = Math.min(i, c.col);
  }), n < t ? t === s : t === i;
}
function Tr(e, n, t) {
  const o = pe(e, t), r = pe(n, t);
  return o.col === r.col;
}
function _t(e, n, t, o) {
  const r = [];
  for (const [i, a] of Object.entries(e.styles || {})) {
    const c = t[i];
    if (!c)
      throw new Error(`style ${i} not found in styleSchema`);
    if (c.propSchema === "boolean")
      a && r.push(n.mark(i));
    else if (c.propSchema === "string")
      a && r.push(n.mark(i, { stringValue: a }));
    else
      throw new K(c.propSchema);
  }
  return !o || !n.nodes[o].spec.code ? e.text.split(/(\n)/g).filter((i) => i.length > 0).map((i) => i === `
` ? n.nodes.hardBreak.createChecked() : n.text(i, r)) : e.text.length > 0 ? [n.text(e.text, r)] : [];
}
function Pr(e, n, t) {
  const o = n.marks.link.create({
    href: e.href
  });
  return pt(e.content, n, t).map(
    (r) => {
      if (r.type.name === "text")
        return r.mark([...r.marks, o]);
      if (r.type.name === "hardBreak")
        return r;
      throw new Error("unexpected node type");
    }
  );
}
function pt(e, n, t, o) {
  const r = [];
  if (typeof e == "string")
    return r.push(
      ..._t(
        { text: e, styles: {} },
        n,
        t,
        o
      )
    ), r;
  for (const s of e)
    r.push(
      ..._t(s, n, t, o)
    );
  return r;
}
function W(e, n, t, o = we(n)) {
  const r = [];
  for (const s of e)
    typeof s == "string" ? r.push(
      ...pt(s, n, o, t)
    ) : fn(s) ? r.push(...Pr(s, n, o)) : ue(s) ? r.push(
      ...pt([s], n, o, t)
    ) : r.push(
      xn(s, n, o)
    );
  return r;
}
function Ke(e, n, t = we(n)) {
  const o = [], r = new Array(e.headerRows ?? 0).fill(!0), s = new Array(e.headerCols ?? 0).fill(!0), i = e.columnWidths ?? [];
  for (let a = 0; a < e.rows.length; a++) {
    const c = e.rows[a], l = [], d = r[a];
    for (let h = 0; h < c.cells.length; h++) {
      const f = c.cells[h], m = s[h], g = void 0;
      let b = null;
      const k = pe(
        {
          row: a,
          col: h
        },
        { content: e }
      );
      let w = i[k.col] ? [i[k.col]] : null;
      if (f) if (typeof f == "string")
        b = n.text(f);
      else if (ve(f)) {
        f.content && (b = W(
          f.content,
          n,
          "tableParagraph",
          t
        ));
        const v = Se(f);
        v > 1 && (w = new Array(v).fill(!1).map((N, z) => i[k.col + z] ?? void 0));
      } else
        b = W(
          f,
          n,
          "tableParagraph",
          t
        );
      const y = n.nodes[m || d ? "tableHeader" : "tableCell"].createChecked(
        {
          ...ve(f) ? f.props : {},
          colwidth: w
        },
        n.nodes.tableParagraph.createChecked(g, b)
      );
      l.push(y);
    }
    const u = n.nodes.tableRow.createChecked({}, l);
    o.push(u);
  }
  return o;
}
function xn(e, n, t) {
  let o, r = e.type;
  if (r === void 0 && (r = "paragraph"), !n.nodes[r])
    throw new Error(`node type ${r} not found in schema`);
  if (!e.content)
    o = n.nodes[r].createChecked(e.props);
  else if (typeof e.content == "string") {
    const s = W(
      [e.content],
      n,
      r,
      t
    );
    o = n.nodes[r].createChecked(e.props, s);
  } else if (Array.isArray(e.content)) {
    const s = W(
      e.content,
      n,
      r,
      t
    );
    o = n.nodes[r].createChecked(e.props, s);
  } else if (e.content.type === "tableContent") {
    const s = Ke(e.content, n, t);
    o = n.nodes[r].createChecked(e.props, s);
  } else
    throw new K(e.content.type);
  return o;
}
function he(e, n, t = we(n)) {
  let o = e.id;
  o === void 0 && (o = je.options.generateID());
  const r = [];
  if (e.children)
    for (const i of e.children)
      r.push(he(i, n, t));
  if (!e.type || // can happen if block.type is not defined (this should create the default node)
  n.nodes[e.type].isInGroup("blockContent")) {
    const i = xn(
      e,
      n,
      t
    ), a = r.length > 0 ? n.nodes.blockGroup.createChecked({}, r) : void 0;
    return n.nodes.blockContainer.createChecked(
      {
        id: o,
        ...e.props
      },
      a ? [i, a] : i
    );
  } else {
    if (n.nodes[e.type].isInGroup("bnBlock"))
      return n.nodes[e.type].createChecked(
        {
          id: o,
          ...e.props
        },
        r
      );
    throw new Error(
      `block type ${e.type} doesn't match blockContent or bnBlock group`
    );
  }
}
function Ir(e, n) {
  if (n === 0)
    return;
  const t = e.resolve(n);
  for (let o = t.depth; o > 0; o--) {
    const r = t.node(o);
    if (Bt(r))
      return r.attrs.id;
  }
}
function F(e, n) {
  let t, o;
  if (n.firstChild.descendants((r, s) => t ? !1 : !Bt(r) || r.attrs.id !== e ? !0 : (t = r, o = s + 1, !1)), !(t === void 0 || o === void 0))
    return {
      node: t,
      posBeforeNode: o
    };
}
function Bt(e) {
  return e.type.isInGroup("bnBlock");
}
function Lr(e, n) {
  return e.id !== n.id || e.type !== n.type || JSON.stringify(e.props) !== JSON.stringify(n.props) || JSON.stringify(e.content) !== JSON.stringify(n.content);
}
function Ar(e) {
  return e.getMeta("paste") ? { type: "paste" } : e.getMeta("uiEvent") === "drop" ? { type: "drop" } : e.getMeta("history$") ? {
    type: e.getMeta("history$").redo ? "redo" : "undo"
  } : e.getMeta("y-sync$") ? e.getMeta("y-sync$").isUndoRedoOperation ? { type: "undo-redo" } : { type: "yjs-remote" } : { type: "local" };
}
function Ut(e) {
  const n = {}, t = A(e);
  return e.descendants((o, r) => {
    if (Bt(o)) {
      const s = Ir(e, r);
      n[o.attrs.id] = {
        block: E(o, t),
        parentId: s
      };
    }
    return !0;
  }), n;
}
function Mn(e, n = []) {
  const t = Ar(e), o = un(e.before, [
    e,
    ...n
  ]), r = Ut(
    o.before
  ), s = Ut(
    o.doc
  ), i = [];
  return Object.keys(s).filter((a) => !(a in r)).forEach((a) => {
    i.push({
      type: "insert",
      block: s[a].block,
      source: t,
      prevBlock: void 0
    });
  }), Object.keys(r).filter((a) => !(a in s)).forEach((a) => {
    i.push({
      type: "delete",
      block: r[a].block,
      source: t,
      prevBlock: void 0
    });
  }), Object.keys(s).filter((a) => a in r).forEach((a) => {
    var u, h;
    const c = r[a], l = s[a];
    c.parentId !== l.parentId ? i.push({
      type: "move",
      block: l.block,
      prevBlock: c.block,
      source: t,
      prevParent: c.parentId ? (u = r[c.parentId]) == null ? void 0 : u.block : void 0,
      currentParent: l.parentId ? (h = s[l.parentId]) == null ? void 0 : h.block : void 0
    }) : Lr(c.block, l.block) && i.push({
      type: "update",
      block: l.block,
      prevBlock: c.block,
      source: t
    });
  }), i;
}
function Nr(e, n, t, o = "before") {
  const r = typeof t == "string" ? t : t.id, s = A(e), i = n.map(
    (d) => he(d, s)
  ), a = F(r, e.doc);
  if (!a)
    throw new Error(`Block with ID ${r} not found`);
  let c = a.posBeforeNode;
  return o === "after" && (c += a.node.nodeSize), e.step(
    new dn(c, c, new Z(R.from(i), 0, 0))
  ), i.map(
    (d) => E(d, s)
  );
}
function $t(e, n, t) {
  const o = A(e), r = t.map(
    (d) => he(d, o)
  ), s = new Set(
    n.map(
      (d) => typeof d == "string" ? d : d.id
    )
  ), i = [], a = typeof n[0] == "string" ? n[0] : n[0].id;
  let c = 0;
  if (e.doc.descendants((d, u) => {
    if (s.size === 0)
      return !1;
    if (!d.type.isInGroup("bnBlock") || !s.has(d.attrs.id))
      return !0;
    if (i.push(E(d, o)), s.delete(d.attrs.id), t.length > 0 && d.attrs.id === a) {
      const g = e.doc.nodeSize;
      e.insert(u, r);
      const b = e.doc.nodeSize;
      c += g - b;
    }
    const h = e.doc.nodeSize, f = e.doc.resolve(u - c);
    f.node().type.name === "blockGroup" && f.node(f.depth - 1).type.name !== "doc" && f.node().childCount === 1 ? e.delete(f.before(), f.after()) : e.delete(u - c, u - c + d.nodeSize);
    const m = e.doc.nodeSize;
    return c += h - m, !1;
  }), s.size > 0) {
    const d = [...s].join(`
`);
    throw Error(
      "Blocks with the following IDs could not be found in the editor: " + d
    );
  }
  return { insertedBlocks: r.map(
    (d) => E(d, o)
  ), removedBlocks: i };
}
const O = (e, n) => ({
  tr: t,
  dispatch: o
}) => (o && Tn(t, e, n), !0);
function Tn(e, n, t, o, r) {
  const s = Te(e.doc.resolve(n)), i = A(e);
  if (o !== void 0 && r !== void 0 && o > r)
    throw new Error("Invalid replaceFromPos or replaceToPos");
  const a = i.nodes[s.blockNoteType], c = i.nodes[t.type || s.blockNoteType], l = c.isInGroup("bnBlock") ? c : i.nodes.blockContainer;
  if (s.isBlockContainer && c.isInGroup("blockContent")) {
    const d = o !== void 0 && o > s.blockContent.beforePos && o < s.blockContent.afterPos ? o - s.blockContent.beforePos - 1 : void 0, u = r !== void 0 && r > s.blockContent.beforePos && r < s.blockContent.afterPos ? r - s.blockContent.beforePos - 1 : void 0;
    Ft(t, e, s), Hr(
      t,
      e,
      a,
      c,
      s,
      d,
      u
    );
  } else if (!s.isBlockContainer && c.isInGroup("bnBlock"))
    Ft(t, e, s);
  else {
    const d = E(s.bnBlock.node, i);
    e.replaceWith(
      s.bnBlock.beforePos,
      s.bnBlock.afterPos,
      he(
        {
          children: d.children,
          // if no children are passed in, use existing children
          ...t
        },
        i
      )
    );
    return;
  }
  e.setNodeMarkup(s.bnBlock.beforePos, l, {
    ...s.bnBlock.node.attrs,
    ...t.props
  });
}
function Hr(e, n, t, o, r, s, i) {
  const a = A(n);
  let c = "keep";
  if (e.content)
    if (typeof e.content == "string")
      c = W(
        [e.content],
        a,
        o.name
      );
    else if (Array.isArray(e.content))
      c = W(e.content, a, o.name);
    else if (e.content.type === "tableContent")
      c = Ke(e.content, a);
    else
      throw new K(e.content.type);
  else
    t.spec.content === "" || o.spec.content !== t.spec.content && (c = []);
  if (c === "keep")
    n.setNodeMarkup(r.blockContent.beforePos, o, {
      ...r.blockContent.node.attrs,
      ...e.props
    });
  else if (s !== void 0 || i !== void 0) {
    n.setNodeMarkup(r.blockContent.beforePos, o, {
      ...r.blockContent.node.attrs,
      ...e.props
    });
    const l = r.blockContent.beforePos + 1 + (s ?? 0), d = r.blockContent.beforePos + 1 + (i ?? r.blockContent.node.content.size), u = n.doc.resolve(r.blockContent.beforePos).depth, h = n.doc.resolve(l).depth, f = n.doc.resolve(d).depth;
    n.replace(
      l,
      d,
      new Z(
        R.from(c),
        h - u - 1,
        f - u - 1
      )
    );
  } else
    n.replaceWith(
      r.blockContent.beforePos,
      r.blockContent.afterPos,
      o.createChecked(
        {
          ...r.blockContent.node.attrs,
          ...e.props
        },
        c
      )
    );
}
function Ft(e, n, t) {
  const o = A(n);
  if (e.children !== void 0 && e.children.length > 0) {
    const r = e.children.map((s) => he(s, o));
    if (t.childContainer)
      n.step(
        new dn(
          t.childContainer.beforePos + 1,
          t.childContainer.afterPos - 1,
          new Z(R.from(r), 0, 0)
        )
      );
    else {
      if (!t.isBlockContainer)
        throw new Error("impossible");
      n.insert(
        t.blockContent.afterPos,
        o.nodes.blockGroup.createChecked({}, r)
      );
    }
  }
}
function Dr(e, n, t, o, r) {
  const s = typeof n == "string" ? n : n.id, i = F(s, e.doc);
  if (!i)
    throw new Error(`Block with ID ${s} not found`);
  Tn(
    e,
    i.posBeforeNode,
    t,
    o,
    r
  );
  const a = e.doc.resolve(i.posBeforeNode + 1).node(), c = A(e);
  return E(a, c);
}
function Pn(e) {
  const n = Array.from(e.classList).filter(
    (t) => !t.startsWith("bn-")
  ) || [];
  n.length > 0 ? e.className = n.join(" ") : e.removeAttribute("class");
}
function In(e, n, t, o) {
  let r;
  if (n)
    if (typeof n == "string")
      r = W([n], e.pmSchema);
    else if (Array.isArray(n))
      r = W(n, e.pmSchema);
    else if (n.type === "tableContent")
      r = Ke(n, e.pmSchema);
    else
      throw new K(n.type);
  else throw new Error("blockContent is required");
  const s = t.serializeFragment(R.from(r), o);
  return s.nodeType === 1 && Pn(s), s;
}
function Or(e, n, t, o, r, s, i) {
  var g, b, k, w, y, v, N, z;
  const a = (i == null ? void 0 : i.document) ?? document, c = n.pmSchema.nodes.blockContainer;
  let l = t.props;
  if (!t.props) {
    l = {};
    for (const [B, S] of Object.entries(
      n.schema.blockSchema[t.type].propSchema
    ))
      S.default !== void 0 && (l[B] = S.default);
  }
  const d = (b = (g = c.spec) == null ? void 0 : g.toDOM) == null ? void 0 : b.call(
    g,
    c.create({
      id: t.id,
      ...l
    })
  ), u = Array.from(d.dom.attributes), h = n.blockImplementations[t.type].implementation.toExternalHTML({ ...t, props: l }, n), f = a.createDocumentFragment();
  if (h.dom.classList.contains("bn-block-content")) {
    const B = [
      ...u,
      ...Array.from(h.dom.attributes)
    ].filter(
      (S) => S.name.startsWith("data") && S.name !== "data-content-type" && S.name !== "data-file-block" && S.name !== "data-node-view-wrapper" && S.name !== "data-node-type" && S.name !== "data-id" && S.name !== "data-index" && S.name !== "data-editable"
    );
    for (const S of B)
      h.dom.firstChild.setAttribute(S.name, S.value);
    Pn(h.dom.firstChild), f.append(...Array.from(h.dom.childNodes));
  } else
    f.append(h.dom);
  if (h.contentDOM && t.content) {
    const B = In(
      n,
      t.content,
      // TODO
      o,
      i
    );
    h.contentDOM.appendChild(B);
  }
  let m;
  if (r.has(t.type) ? m = "OL" : s.has(t.type) && (m = "UL"), m) {
    if (((k = e.lastChild) == null ? void 0 : k.nodeName) !== m) {
      const S = a.createElement(m);
      m === "OL" && (l != null && l.start) && (l == null ? void 0 : l.start) !== 1 && S.setAttribute("start", l.start + ""), e.append(S);
    }
    const B = a.createElement("li");
    B.append(f), e.lastChild.appendChild(B);
  } else
    e.append(f);
  if (t.children && t.children.length > 0) {
    const B = a.createDocumentFragment();
    if (Ln(
      B,
      n,
      t.children,
      o,
      r,
      s,
      i
    ), ((w = e.lastChild) == null ? void 0 : w.nodeName) === "UL" || ((y = e.lastChild) == null ? void 0 : y.nodeName) === "OL")
      for (; ((v = B.firstChild) == null ? void 0 : v.nodeName) === "UL" || ((N = B.firstChild) == null ? void 0 : N.nodeName) === "OL"; )
        e.lastChild.lastChild.appendChild(B.firstChild);
    n.pmSchema.nodes[t.type].isInGroup("blockContent") ? e.append(B) : (z = h.contentDOM) == null || z.append(B);
  }
}
const Ln = (e, n, t, o, r, s, i) => {
  for (const a of t)
    Or(
      e,
      n,
      a,
      o,
      r,
      s,
      i
    );
}, Rr = (e, n, t, o, r, s) => {
  const a = ((s == null ? void 0 : s.document) ?? document).createDocumentFragment();
  return Ln(
    a,
    e,
    n,
    t,
    o,
    r,
    s
  ), a;
}, Ye = (e, n) => {
  const t = ln.fromSchema(e);
  return {
    exportBlocks: (o, r) => {
      const s = Rr(
        n,
        o,
        t,
        /* @__PURE__ */ new Set(["numberedListItem"]),
        /* @__PURE__ */ new Set(["bulletListItem", "checkListItem"]),
        r
      ), i = document.createElement("div");
      return i.append(s), i.innerHTML;
    },
    exportInlineContent: (o, r) => {
      const s = In(
        n,
        o,
        t,
        r
      ), i = document.createElement("div");
      return i.append(s.cloneNode(!0)), i.innerHTML;
    }
  };
};
function Vr(e, n, t, o, r) {
  let s;
  if (n)
    if (typeof n == "string")
      s = W([n], e.pmSchema, o);
    else if (Array.isArray(n))
      s = W(n, e.pmSchema, o);
    else if (n.type === "tableContent")
      s = Ke(n, e.pmSchema);
    else
      throw new K(n.type);
  else throw new Error("blockContent is required");
  return t.serializeFragment(R.from(s), r);
}
function _r(e, n, t, o, r) {
  var u, h, f, m, g;
  const s = e.pmSchema.nodes.blockContainer;
  let i = n.props;
  if (!n.props) {
    i = {};
    for (const [b, k] of Object.entries(
      e.schema.blockSchema[n.type].propSchema
    ))
      k.default !== void 0 && (i[b] = k.default);
  }
  const c = e.blockImplementations[n.type].implementation.toInternalHTML({ ...n, props: i }, e);
  if (n.type === "numberedListItem" && c.dom.setAttribute("data-index", o.toString()), n.type === "customListItem" && c.dom.setAttribute("data-index", o.toString()), c.contentDOM && n.content) {
    const b = Vr(
      e,
      n.content,
      // TODO
      t,
      n.type,
      r
    );
    c.contentDOM.appendChild(b);
  }
  if (e.pmSchema.nodes[n.type].isInGroup("bnBlock")) {
    if (n.children && n.children.length > 0) {
      const b = An(
        e,
        n.children,
        t,
        r
      );
      (u = c.contentDOM) == null || u.append(b);
    }
    return c.dom;
  }
  const d = (f = (h = s.spec) == null ? void 0 : h.toDOM) == null ? void 0 : f.call(
    h,
    s.create({
      id: n.id,
      ...i
    })
  );
  return (m = d.contentDOM) == null || m.appendChild(c.dom), n.children && n.children.length > 0 && ((g = d.contentDOM) == null || g.appendChild(
    Nn(e, n.children, t, r)
  )), d.dom;
}
function An(e, n, t, o) {
  const s = ((o == null ? void 0 : o.document) ?? document).createDocumentFragment();
  let i = 0;
  for (const a of n) {
    a.type === "numberedListItem" ? i++ : i = 0;
    const c = _r(
      e,
      a,
      t,
      i,
      o
    );
    s.appendChild(c);
  }
  return s;
}
const Nn = (e, n, t, o) => {
  var a;
  const r = e.pmSchema.nodes.blockGroup, s = r.spec.toDOM(r.create({})), i = An(e, n, t, o);
  return (a = s.contentDOM) == null || a.appendChild(i), s.dom;
}, Ur = (e, n) => {
  const t = ln.fromSchema(e);
  return {
    serializeBlocks: (o, r) => Nn(n, o, t, r).outerHTML
  };
}, Je = (e, n) => {
  const t = e.querySelector(
    n
  );
  if (!t)
    return;
  const o = e.querySelector("figcaption"), r = (o == null ? void 0 : o.textContent) ?? void 0;
  return { targetElement: t, caption: r };
}, $r = (e, n, t, o) => {
  const r = document.createElement("div");
  r.className = "bn-add-file-button";
  const s = document.createElement("div");
  s.className = "bn-add-file-button-icon", o ? s.appendChild(o) : s.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 8L9.00319 2H19.9978C20.5513 2 21 2.45531 21 2.9918V21.0082C21 21.556 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5501 3 20.9932V8ZM10 4V9H5V20H19V4H10Z"></path></svg>', r.appendChild(s);
  const i = document.createElement("p");
  i.className = "bn-add-file-button-text", i.innerHTML = t || n.dictionary.file_blocks.file.add_button_text, r.appendChild(i);
  const a = (l) => {
    l.preventDefault();
  }, c = () => {
    n.transact(
      (l) => l.setMeta(n.filePanel.plugins[0], {
        block: e
      })
    );
  };
  return r.addEventListener(
    "mousedown",
    a,
    !0
  ), r.addEventListener("click", c, !0), {
    dom: r,
    destroy: () => {
      r.removeEventListener(
        "mousedown",
        a,
        !0
      ), r.removeEventListener(
        "click",
        c,
        !0
      );
    }
  };
}, Fr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 8L9.00319 2H19.9978C20.5513 2 21 2.45531 21 2.9918V21.0082C21 21.556 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5501 3 20.9932V8ZM10 4V9H5V20H19V4H10Z"></path></svg>', zr = (e) => {
  const n = document.createElement("div");
  n.className = "bn-file-name-with-icon";
  const t = document.createElement("div");
  t.className = "bn-file-icon", t.innerHTML = Fr, n.appendChild(t);
  const o = document.createElement("p");
  return o.className = "bn-file-name", o.textContent = e.props.name, n.appendChild(o), {
    dom: n
  };
}, xt = (e, n, t, o, r) => {
  const s = document.createElement("div");
  if (s.className = "bn-file-block-content-wrapper", e.props.url === "") {
    const a = $r(
      e,
      n,
      o,
      r
    );
    s.appendChild(a.dom);
    const c = n.onUploadStart((l) => {
      if (l === e.id) {
        s.removeChild(a.dom);
        const d = document.createElement("div");
        d.className = "bn-file-loading-preview", d.textContent = "Loading...", s.appendChild(d);
      }
    });
    return {
      dom: s,
      destroy: () => {
        c(), a.destroy();
      }
    };
  }
  const i = { dom: s };
  if (e.props.showPreview === !1 || !t) {
    const a = zr(e);
    s.appendChild(a.dom), i.destroy = () => {
      var c;
      (c = a.destroy) == null || c.call(a);
    };
  } else
    s.appendChild(t.dom);
  if (e.props.caption) {
    const a = document.createElement("p");
    a.className = "bn-file-caption", a.textContent = e.props.caption, s.appendChild(a);
  }
  return i;
}, Mt = (e, n) => {
  const t = document.createElement("figure"), o = document.createElement("figcaption");
  return o.textContent = n, t.appendChild(e), t.appendChild(o), { dom: t };
}, Xe = (e, n) => {
  const t = document.createElement("div"), o = document.createElement("p");
  return o.textContent = n, t.appendChild(e), t.appendChild(o), {
    dom: t
  };
}, zt = (e) => ({ url: e.src || void 0 }), Wr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 16.0001H5.88889L11.1834 20.3319C11.2727 20.405 11.3846 20.4449 11.5 20.4449C11.7761 20.4449 12 20.2211 12 19.9449V4.05519C12 3.93977 11.9601 3.8279 11.887 3.73857C11.7121 3.52485 11.3971 3.49335 11.1834 3.66821L5.88889 8.00007H2C1.44772 8.00007 1 8.44778 1 9.00007V15.0001C1 15.5524 1.44772 16.0001 2 16.0001ZM23 12C23 15.292 21.5539 18.2463 19.2622 20.2622L17.8445 18.8444C19.7758 17.1937 21 14.7398 21 12C21 9.26016 19.7758 6.80629 17.8445 5.15557L19.2622 3.73779C21.5539 5.75368 23 8.70795 23 12ZM18 12C18 10.0883 17.106 8.38548 15.7133 7.28673L14.2842 8.71584C15.3213 9.43855 16 10.64 16 12C16 13.36 15.3213 14.5614 14.2842 15.2841L15.7133 16.7132C17.106 15.6145 18 13.9116 18 12Z"></path></svg>', jr = {
  backgroundColor: M.backgroundColor,
  // File name.
  name: {
    default: ""
  },
  // File url.
  url: {
    default: ""
  },
  // File caption.
  caption: {
    default: ""
  },
  showPreview: {
    default: !0
  }
}, Gr = {
  type: "audio",
  propSchema: jr,
  content: "none",
  isFileBlock: !0,
  fileBlockAccept: ["audio/*"]
}, qr = (e, n) => {
  const t = document.createElement("div");
  t.innerHTML = Wr;
  const o = document.createElement("audio");
  return o.className = "bn-audio", n.resolveFileUrl ? n.resolveFileUrl(e.props.url).then((r) => {
    o.src = r;
  }) : o.src = e.props.url, o.controls = !0, o.contentEditable = "false", o.draggable = !1, xt(
    e,
    n,
    { dom: o },
    n.dictionary.file_blocks.audio.add_button_text,
    t.firstElementChild
  );
}, Kr = (e) => {
  if (e.tagName === "AUDIO")
    return e.closest("figure") ? void 0 : zt(e);
  if (e.tagName === "FIGURE") {
    const n = Je(e, "audio");
    if (!n)
      return;
    const { targetElement: t, caption: o } = n;
    return {
      ...zt(t),
      caption: o
    };
  }
}, Yr = (e) => {
  if (!e.props.url) {
    const t = document.createElement("p");
    return t.textContent = "Add audio", {
      dom: t
    };
  }
  let n;
  return e.props.showPreview ? (n = document.createElement("audio"), n.src = e.props.url) : (n = document.createElement("a"), n.href = e.props.url, n.textContent = e.props.name || e.props.url), e.props.caption ? e.props.showPreview ? Mt(n, e.props.caption) : Xe(n, e.props.caption) : {
    dom: n
  };
}, Jr = Me(Gr, {
  render: qr,
  parse: Kr,
  toExternalHTML: Yr
}), Wt = Symbol.for("blocknote.shikiParser"), et = Symbol.for(
  "blocknote.shikiHighlighterPromise"
), Xr = {
  language: {
    default: "text"
  }
}, Zr = j({
  name: "codeBlock",
  content: "inline*",
  group: "blockContent",
  marks: "insertion deletion modification",
  code: !0,
  defining: !0,
  addOptions() {
    return {
      defaultLanguage: "text",
      indentLineWithTab: !0,
      supportedLanguages: {}
    };
  },
  addAttributes() {
    const e = this.options;
    return {
      language: {
        default: e.editor.settings.codeBlock.defaultLanguage,
        parseHTML: (n) => {
          let t = n, o = null;
          (t == null ? void 0 : t.tagName) === "DIV" && (t == null ? void 0 : t.dataset.contentType) === "codeBlock" && (t = t.children[0]), (t == null ? void 0 : t.tagName) === "PRE" && (t = t == null ? void 0 : t.children[0]);
          const r = t == null ? void 0 : t.getAttribute("data-language");
          if (r)
            o = r.toLowerCase();
          else {
            const i = [...(t == null ? void 0 : t.className.split(" ")) || []].filter((a) => a.startsWith("language-")).map((a) => a.replace("language-", ""));
            i.length > 0 && (o = i[0].toLowerCase());
          }
          return o ? tt(e.editor.settings.codeBlock, o) ?? o : null;
        },
        renderHTML: (n) => n.language ? {
          class: `language-${n.language}`,
          "data-language": n.language
        } : {}
      }
    };
  },
  parseHTML() {
    return [
      // Parse from internal HTML.
      {
        tag: "div[data-content-type=" + this.name + "]",
        contentElement: ".bn-inline-content"
      },
      // Parse from external HTML.
      {
        tag: "pre",
        // contentElement: "code",
        preserveWhitespace: "full"
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    var r, s;
    const n = document.createElement("pre"), { dom: t, contentDOM: o } = $(
      this.name,
      "code",
      ((r = this.options.domAttributes) == null ? void 0 : r.blockContent) || {},
      {
        ...((s = this.options.domAttributes) == null ? void 0 : s.inlineContent) || {},
        ...e
      }
    );
    return t.removeChild(o), t.appendChild(n), n.appendChild(o), {
      dom: t,
      contentDOM: o
    };
  },
  addNodeView() {
    const e = this.options;
    return ({ editor: n, node: t, getPos: o, HTMLAttributes: r }) => {
      var u, h;
      const s = document.createElement("pre"), i = document.createElement("select"), a = document.createElement("div"), { dom: c, contentDOM: l } = $(
        this.name,
        "code",
        {
          ...((u = this.options.domAttributes) == null ? void 0 : u.blockContent) || {},
          ...r
        },
        ((h = this.options.domAttributes) == null ? void 0 : h.inlineContent) || {}
      ), d = (f) => {
        const m = f.target.value;
        n.commands.command(({ tr: g }) => (g.setNodeAttribute(o(), "language", m), !0));
      };
      return Object.entries(
        e.editor.settings.codeBlock.supportedLanguages
      ).forEach(([f, { name: m }]) => {
        const g = document.createElement("option");
        g.value = f, g.text = m, i.appendChild(g);
      }), a.contentEditable = "false", i.value = t.attrs.language || e.editor.settings.codeBlock.defaultLanguage, c.removeChild(l), c.appendChild(a), c.appendChild(s), s.appendChild(l), a.appendChild(i), i.addEventListener("change", d), {
        dom: c,
        contentDOM: l,
        update: (f) => f.type === this.type,
        destroy: () => {
          i.removeEventListener("change", d);
        }
      };
    };
  },
  addProseMirrorPlugins() {
    const e = this.options, n = globalThis;
    let t, o, r = !1;
    return [Eo({
      parser: (a) => {
        if (!e.editor.settings.codeBlock.createHighlighter)
          return process.env.NODE_ENV === "development" && !r && (console.log(
            "For syntax highlighting of code blocks, you must provide a `codeBlock.createHighlighter` function"
          ), r = !0), [];
        if (!t)
          return n[et] = n[et] || e.editor.settings.codeBlock.createHighlighter(), n[et].then(
            (l) => {
              t = l;
            }
          );
        const c = tt(
          e.editor.settings.codeBlock,
          a.language
        );
        return !c || c === "text" || c === "none" || c === "plaintext" || c === "txt" ? [] : t.getLoadedLanguages().includes(c) ? (o || (o = n[Wt] || Bo(t), n[Wt] = o), o(a)) : t.loadLanguage(c);
      },
      languageExtractor: (a) => a.attrs.language,
      nodeTypes: [this.name]
    })];
  },
  addInputRules() {
    const e = this.options;
    return [
      new le({
        find: /^```(.*?)\s$/,
        handler: ({ state: n, range: t, match: o }) => {
          const r = n.doc.resolve(t.from), s = o[1].trim(), i = {
            language: tt(e.editor.settings.codeBlock, s) ?? s
          };
          if (!r.node(-1).canReplaceWith(
            r.index(-1),
            r.indexAfter(-1),
            this.type
          ))
            return null;
          n.tr.delete(t.from, t.to).setBlockType(t.from, t.from, this.type, i).setSelection(H.create(n.tr.doc, t.from));
        }
      })
    ];
  },
  addKeyboardShortcuts() {
    return {
      Delete: ({ editor: e }) => {
        const { selection: n } = e.state, { $from: t } = n;
        if (e.isActive(this.name) && !t.parent.textContent && pn(n)) {
          const o = t.pos - t.parentOffset - 2;
          return e.chain().setNodeSelection(o).deleteSelection().run(), !0;
        }
        return !1;
      },
      Tab: ({ editor: e }) => this.options.indentLineWithTab && e.isActive(this.name) ? (e.commands.insertContent("  "), !0) : !1,
      Enter: ({ editor: e }) => {
        const { $from: n } = e.state.selection;
        if (!e.isActive(this.name))
          return !1;
        const t = n.parentOffset === n.parent.nodeSize - 2, o = n.parent.textContent.endsWith(`

`);
        return !t || !o ? (e.commands.insertContent(`
`), !0) : e.chain().command(({ tr: r }) => (r.delete(n.pos - 2, n.pos), !0)).exitCode().run();
      },
      "Shift-Enter": ({ editor: e }) => {
        const { $from: n } = e.state.selection;
        return e.isActive(this.name) ? (e.chain().insertContentAt(
          n.pos - n.parentOffset + n.parent.nodeSize,
          {
            type: "paragraph"
          }
        ).run(), !0) : !1;
      }
    };
  }
}), Qr = J(
  Zr,
  Xr
);
function tt(e, n) {
  var t;
  return (t = Object.entries(e.supportedLanguages).find(
    ([o, { aliases: r }]) => (r == null ? void 0 : r.includes(n)) || o === n
  )) == null ? void 0 : t[0];
}
const es = re.create({
  name: "backgroundColor",
  addAttributes() {
    return {
      stringValue: {
        default: void 0,
        parseHTML: (e) => e.getAttribute("data-background-color"),
        renderHTML: (e) => ({
          "data-background-color": e.stringValue
        })
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (e) => typeof e == "string" ? !1 : e.hasAttribute("data-background-color") ? {
          stringValue: e.getAttribute("data-background-color")
        } : !1
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    return ["span", e, 0];
  }
}), ts = ae(
  es,
  "string"
), ns = re.create({
  name: "textColor",
  addAttributes() {
    return {
      stringValue: {
        default: void 0,
        parseHTML: (e) => e.getAttribute("data-text-color"),
        renderHTML: (e) => ({
          "data-text-color": e.stringValue
        })
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (e) => typeof e == "string" ? !1 : e.hasAttribute("data-text-color") ? { stringValue: e.getAttribute("data-text-color") } : !1
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    return ["span", e, 0];
  }
}), os = ae(ns, "string"), jt = (e) => ({ url: e.src || void 0 }), rs = {
  backgroundColor: M.backgroundColor,
  // File name.
  name: {
    default: ""
  },
  // File url.
  url: {
    default: ""
  },
  // File caption.
  caption: {
    default: ""
  }
}, ss = {
  type: "file",
  propSchema: rs,
  content: "none",
  isFileBlock: !0
}, is = (e, n) => xt(e, n), as = (e) => {
  if (e.tagName === "EMBED")
    return e.closest("figure") ? void 0 : jt(e);
  if (e.tagName === "FIGURE") {
    const n = Je(e, "embed");
    if (!n)
      return;
    const { targetElement: t, caption: o } = n;
    return {
      ...jt(t),
      caption: o
    };
  }
}, cs = (e) => {
  if (!e.props.url) {
    const t = document.createElement("p");
    return t.textContent = "Add file", {
      dom: t
    };
  }
  const n = document.createElement("a");
  return n.href = e.props.url, n.textContent = e.props.name || e.props.url, e.props.caption ? Xe(n, e.props.caption) : {
    dom: n
  };
}, ls = Me(ss, {
  render: is,
  parse: as,
  toExternalHTML: cs
}), ds = {
  set: (e, n) => window.localStorage.setItem(
    `toggle-${e.id}`,
    n ? "true" : "false"
  ),
  get: (e) => window.localStorage.getItem(`toggle-${e.id}`) === "true"
}, Hn = (e, n, t, o = ds) => {
  if ("isToggleable" in e.props && !e.props.isToggleable)
    return {
      dom: t
    };
  const r = document.createElement("div"), s = document.createElement("div");
  s.className = "bn-toggle-wrapper";
  const i = document.createElement("button");
  i.className = "bn-toggle-button", i.type = "button", i.innerHTML = // https://fonts.google.com/icons?selected=Material+Symbols+Rounded:chevron_right:FILL@0;wght@700;GRAD@0;opsz@24&icon.query=chevron&icon.style=Rounded&icon.size=24&icon.color=%23e8eaed
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="CURRENTCOLOR"><path d="M320-200v-560l440 280-440 280Z"/></svg>';
  const a = (m) => m.preventDefault();
  i.addEventListener("mousedown", a);
  const c = () => {
    var m;
    s.getAttribute("data-show-children") === "true" ? (s.setAttribute("data-show-children", "false"), o.set(n.getBlock(e), !1), r.contains(l) && r.removeChild(l)) : (s.setAttribute("data-show-children", "true"), o.set(n.getBlock(e), !0), ((m = n.getBlock(e)) == null ? void 0 : m.children.length) === 0 && !r.contains(l) && r.appendChild(l));
  };
  i.addEventListener("click", c), s.appendChild(i), s.appendChild(t);
  const l = document.createElement("button");
  l.className = "bn-toggle-add-block-button", l.type = "button", l.textContent = "Empty toggle. Click to add a block.";
  const d = (m) => m.preventDefault();
  l.addEventListener(
    "mousedown",
    d
  );
  const u = () => {
    n.transact(() => {
      const m = n.updateBlock(e, {
        // Single empty block with default type.
        children: [{}]
      });
      n.setTextCursorPosition(m.children[0].id, "end"), n.focus();
    });
  };
  l.addEventListener("click", u), r.appendChild(s);
  let h = e.children.length;
  const f = n.onChange(() => {
    var g;
    const m = ((g = n.getBlock(e)) == null ? void 0 : g.children.length) ?? 0;
    m > h ? (s.getAttribute("data-show-children") === "false" && (s.setAttribute("data-show-children", "true"), o.set(n.getBlock(e), !0)), r.contains(l) && r.removeChild(l)) : m === 0 && m < h && (s.getAttribute("data-show-children") === "true" && (s.setAttribute("data-show-children", "false"), o.set(n.getBlock(e), !1)), r.contains(l) && r.removeChild(l)), h = m;
  });
  return o.get(e) ? (s.setAttribute("data-show-children", "true"), e.children.length === 0 && r.appendChild(l)) : s.setAttribute("data-show-children", "false"), {
    dom: r,
    // Prevents re-renders when the toggle button is clicked.
    ignoreMutation: (m) => m instanceof MutationRecord && // We want to prevent re-renders when the view changes, so we ignore
    // all mutations where the `data-show-children` attribute is changed
    // or the "add block" button is added/removed.
    (m.type === "attributes" && m.target === s && m.attributeName === "data-show-children" || m.type === "childList" && (m.addedNodes[0] === l || m.removedNodes[0] === l)),
    destroy: () => {
      i.removeEventListener("mousedown", a), i.removeEventListener("click", c), l.removeEventListener(
        "mousedown",
        d
      ), l.removeEventListener(
        "click",
        u
      ), f == null || f();
    }
  };
}, us = [1, 2, 3, 4, 5, 6], Dn = {
  ...M,
  level: { default: 1, values: us },
  isToggleable: { default: !1 }
}, ps = j({
  name: "heading",
  content: "inline*",
  group: "blockContent",
  addAttributes() {
    return ke(Dn);
  },
  addInputRules() {
    return [
      ...this.options.editor.settings.heading.levels.map((n) => new le({
        find: new RegExp(`^(#{${n}})\\s$`),
        handler: ({ state: t, chain: o, range: r }) => {
          const s = C(t);
          !s.isBlockContainer || s.blockContent.node.type.spec.content !== "inline*" || o().command(
            O(s.bnBlock.beforePos, {
              type: "heading",
              props: {
                level: n
              }
            })
          ).deleteRange({ from: r.from, to: r.to }).run();
        }
      }))
    ];
  },
  addKeyboardShortcuts() {
    const e = this.options.editor;
    return Object.fromEntries(
      e.settings.heading.levels.map((n) => [
        `Mod-Alt-${n}`,
        () => {
          const t = C(this.editor.state);
          return !t.isBlockContainer || t.blockContent.node.type.spec.content !== "inline*" ? !0 : this.editor.commands.command(
            O(t.bnBlock.beforePos, {
              type: "heading",
              props: {
                level: n
              }
            })
          );
        }
      ])
    );
  },
  parseHTML() {
    const e = this.options.editor;
    return [
      // Parse from internal HTML.
      {
        tag: "div[data-content-type=" + this.name + "]",
        contentElement: ".bn-inline-content"
      },
      ...e.settings.heading.levels.map((n) => ({
        tag: `h${n}`,
        attrs: { level: n },
        node: "heading"
      }))
    ];
  },
  renderHTML({ node: e, HTMLAttributes: n }) {
    var t, o;
    return $(
      this.name,
      `h${e.attrs.level}`,
      {
        ...((t = this.options.domAttributes) == null ? void 0 : t.blockContent) || {},
        ...n
      },
      ((o = this.options.domAttributes) == null ? void 0 : o.inlineContent) || {}
    );
  },
  addNodeView() {
    return ({ node: e, HTMLAttributes: n, getPos: t }) => {
      var c, l;
      const { dom: o, contentDOM: r } = $(
        this.name,
        `h${e.attrs.level}`,
        {
          ...((c = this.options.domAttributes) == null ? void 0 : c.blockContent) || {},
          ...n
        },
        ((l = this.options.domAttributes) == null ? void 0 : l.inlineContent) || {}
      );
      o.removeChild(r);
      const s = this.options.editor, i = wt(t, s, this.editor, this.name), a = Hn(
        i,
        s,
        r
      );
      return o.appendChild(a.dom), {
        dom: o,
        contentDOM: r,
        ignoreMutation: a.ignoreMutation,
        destroy: a.destroy
      };
    };
  }
}), hs = J(
  ps,
  Dn
), On = (e, n, t, o, r, s) => {
  const { dom: i, destroy: a } = xt(
    e,
    n,
    t,
    r,
    s
  ), c = i;
  e.props.url && e.props.showPreview && (e.props.previewWidth ? c.style.width = `${e.props.previewWidth}px` : c.style.width = "fit-content");
  const l = document.createElement("div");
  l.className = "bn-resize-handle", l.style.left = "4px";
  const d = document.createElement("div");
  d.className = "bn-resize-handle", d.style.right = "4px";
  let u, h = e.props.previewWidth;
  const f = (y) => {
    var z, B;
    if (!u) {
      !n.isEditable && o.contains(l) && o.contains(d) && (o.removeChild(l), o.removeChild(d));
      return;
    }
    let v;
    e.props.textAlignment === "center" ? u.handleUsed === "left" ? v = u.initialWidth + (u.initialClientX - y.clientX) * 2 : v = u.initialWidth + (y.clientX - u.initialClientX) * 2 : u.handleUsed === "left" ? v = u.initialWidth + u.initialClientX - y.clientX : v = u.initialWidth + y.clientX - u.initialClientX, h = Math.min(
      Math.max(v, 64),
      ((B = (z = n.domElement) == null ? void 0 : z.firstElementChild) == null ? void 0 : B.clientWidth) || Number.MAX_VALUE
    ), c.style.width = `${h}px`;
  }, m = (y) => {
    (!y.target || !c.contains(y.target) || !n.isEditable) && o.contains(l) && o.contains(d) && (o.removeChild(l), o.removeChild(d)), u && (u = void 0, n.updateBlock(e, {
      props: {
        previewWidth: h
      }
    }));
  }, g = () => {
    n.isEditable && (o.appendChild(l), o.appendChild(d));
  }, b = (y) => {
    y.relatedTarget === l || y.relatedTarget === d || u || n.isEditable && o.contains(l) && o.contains(d) && (o.removeChild(l), o.removeChild(d));
  }, k = (y) => {
    y.preventDefault(), u = {
      handleUsed: "left",
      initialWidth: c.clientWidth,
      initialClientX: y.clientX
    };
  }, w = (y) => {
    y.preventDefault(), u = {
      handleUsed: "right",
      initialWidth: c.clientWidth,
      initialClientX: y.clientX
    };
  };
  return window.addEventListener("mousemove", f), window.addEventListener("mouseup", m), c.addEventListener("mouseenter", g), c.addEventListener("mouseleave", b), l.addEventListener(
    "mousedown",
    k
  ), d.addEventListener(
    "mousedown",
    w
  ), {
    dom: c,
    destroy: () => {
      a == null || a(), window.removeEventListener("mousemove", f), window.removeEventListener("mouseup", m), c.removeEventListener("mouseenter", g), c.removeEventListener("mouseleave", b), l.removeEventListener(
        "mousedown",
        k
      ), d.removeEventListener(
        "mousedown",
        w
      );
    }
  };
}, Gt = (e) => {
  const n = e.src || void 0, t = e.width || void 0;
  return { url: n, previewWidth: t };
}, fs = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11.1005L7 9.1005L12.5 14.6005L16 11.1005L19 14.1005V5H5V11.1005ZM4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM15.5 10C14.6716 10 14 9.32843 14 8.5C14 7.67157 14.6716 7 15.5 7C16.3284 7 17 7.67157 17 8.5C17 9.32843 16.3284 10 15.5 10Z"></path></svg>', ms = {
  textAlignment: M.textAlignment,
  backgroundColor: M.backgroundColor,
  // File name.
  name: {
    default: ""
  },
  // File url.
  url: {
    default: ""
  },
  // File caption.
  caption: {
    default: ""
  },
  showPreview: {
    default: !0
  },
  // File preview width in px.
  previewWidth: {
    default: void 0,
    type: "number"
  }
}, gs = {
  type: "image",
  propSchema: ms,
  content: "none",
  isFileBlock: !0,
  fileBlockAccept: ["image/*"]
}, bs = (e, n) => {
  const t = document.createElement("div");
  t.innerHTML = fs;
  const o = document.createElement("div");
  o.className = "bn-visual-media-wrapper";
  const r = document.createElement("img");
  return r.className = "bn-visual-media", n.resolveFileUrl ? n.resolveFileUrl(e.props.url).then((s) => {
    r.src = s;
  }) : r.src = e.props.url, r.alt = e.props.name || e.props.caption || "BlockNote image", r.contentEditable = "false", r.draggable = !1, o.appendChild(r), On(
    e,
    n,
    { dom: o },
    o,
    n.dictionary.file_blocks.image.add_button_text,
    t.firstElementChild
  );
}, ks = (e) => {
  if (e.tagName === "IMG")
    return e.closest("figure") ? void 0 : Gt(e);
  if (e.tagName === "FIGURE") {
    const n = Je(e, "img");
    if (!n)
      return;
    const { targetElement: t, caption: o } = n;
    return {
      ...Gt(t),
      caption: o
    };
  }
}, ws = (e) => {
  if (!e.props.url) {
    const t = document.createElement("p");
    return t.textContent = "Add image", {
      dom: t
    };
  }
  let n;
  return e.props.showPreview ? (n = document.createElement("img"), n.src = e.props.url, n.alt = e.props.name || e.props.caption || "BlockNote image", e.props.previewWidth && (n.width = e.props.previewWidth)) : (n = document.createElement("a"), n.href = e.props.url, n.textContent = e.props.name || e.props.url), e.props.caption ? e.props.showPreview ? Mt(n, e.props.caption) : Xe(n, e.props.caption) : {
    dom: n
  };
}, ys = Me(gs, {
  render: bs,
  parse: ks,
  toExternalHTML: ws
}), Rn = (e, n, t) => ({
  state: o,
  dispatch: r
}) => {
  const s = ee(o.doc, e), i = Y(s);
  if (!i.isBlockContainer)
    throw new Error(
      `BlockContainer expected when calling splitBlock, position ${e}`
    );
  const a = [
    {
      type: i.bnBlock.node.type,
      // always keep blockcontainer type
      attrs: t ? { ...i.bnBlock.node.attrs, id: void 0 } : {}
    },
    {
      type: n ? i.blockContent.node.type : o.schema.nodes.paragraph,
      attrs: t ? { ...i.blockContent.node.attrs } : {}
    }
  ];
  return r && o.tr.split(e, 2, a), !0;
}, Ze = (e) => {
  const { blockInfo: n, selectionEmpty: t } = e.transact((s) => ({
    blockInfo: Ge(s),
    selectionEmpty: s.selection.anchor === s.selection.head
  }));
  if (!n.isBlockContainer)
    return !1;
  const { bnBlock: o, blockContent: r } = n;
  return !(r.node.type.name === "toggleListItem" || r.node.type.name === "bulletListItem" || r.node.type.name === "numberedListItem" || r.node.type.name === "checkListItem" || r.node.type.name === "customListItem") || !t ? !1 : e._tiptapEditor.commands.first(({ state: s, chain: i, commands: a }) => [
    () => (
      // Changes list item block to a paragraph block if the content is empty.
      a.command(() => r.node.childCount === 0 ? a.command(
        O(o.beforePos, {
          type: "paragraph",
          props: {}
        })
      ) : !1)
    ),
    () => (
      // Splits the current block, moving content inside that's after the cursor
      // to a new block of the same type below.
      a.command(() => r.node.childCount > 0 ? (i().deleteSelection().command(Rn(s.selection.from, !0)).run(), !0) : !1)
    )
  ]);
}, Cs = {
  ...M
}, vs = j({
  name: "toggleListItem",
  content: "inline*",
  group: "blockContent",
  // This is to make sure that the list item Enter keyboard handler takes
  // priority over the default one.
  priority: 90,
  addKeyboardShortcuts() {
    return {
      Enter: () => Ze(this.options.editor),
      "Mod-Shift-6": () => {
        const e = C(this.editor.state);
        return !e.isBlockContainer || e.blockContent.node.type.spec.content !== "inline*" ? !0 : this.editor.commands.command(
          O(e.bnBlock.beforePos, {
            type: "toggleListItem",
            props: {}
          })
        );
      }
    };
  },
  parseHTML() {
    return [
      // Parse from internal HTML.
      {
        tag: "div[data-content-type=" + this.name + "]",
        contentElement: ".bn-inline-content"
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    var n, t;
    return $(
      this.name,
      "p",
      {
        ...((n = this.options.domAttributes) == null ? void 0 : n.blockContent) || {},
        ...e
      },
      ((t = this.options.domAttributes) == null ? void 0 : t.inlineContent) || {}
    );
  },
  addNodeView() {
    return ({ HTMLAttributes: e, getPos: n }) => {
      var a, c;
      const { dom: t, contentDOM: o } = $(
        this.name,
        "p",
        {
          ...((a = this.options.domAttributes) == null ? void 0 : a.blockContent) || {},
          ...e
        },
        ((c = this.options.domAttributes) == null ? void 0 : c.inlineContent) || {}
      ), r = this.options.editor, s = wt(n, r, this.editor, this.name), i = Hn(
        s,
        r,
        o
      );
      return t.appendChild(i.dom), {
        dom: t,
        contentDOM: o,
        ignoreMutation: i.ignoreMutation,
        destroy: i.destroy
      };
    };
  }
}), Ss = J(
  vs,
  Cs
);
function Qe(e, n, t) {
  var u, h, f;
  const o = Be.fromSchema(n), r = e, s = document.createElement("div");
  s.setAttribute("data-node-type", "blockGroup");
  for (const m of Array.from(r.childNodes))
    s.appendChild(m.cloneNode(!0));
  let i = o.parse(s, {
    topNode: n.nodes.blockGroup.create()
  });
  ((h = (u = i.firstChild) == null ? void 0 : u.firstChild) == null ? void 0 : h.type.name) === "checkListItem" && (i = i.copy(
    i.content.cut(
      i.firstChild.firstChild.nodeSize + 2
    )
  ));
  const a = (f = i.firstChild) == null ? void 0 : f.firstChild;
  if (!(a != null && a.isTextblock))
    return R.from(i);
  const c = n.nodes[t].create(
    {},
    a.content
  ), l = i.content.cut(
    // +2 for the `blockGroup` node's start and end markers
    a.nodeSize + 2
  );
  if (l.size > 0) {
    const m = i.copy(l);
    return c.content.addToEnd(m);
  }
  return c.content;
}
const Es = {
  ...M
}, Bs = j({
  name: "bulletListItem",
  content: "inline*",
  group: "blockContent",
  // This is to make sure that check list parse rules run before, since they
  // both parse `li` elements but check lists are more specific.
  priority: 90,
  addInputRules() {
    return [
      // Creates an unordered list when starting with "-", "+", or "*".
      new le({
        find: new RegExp("^[-+*]\\s$"),
        handler: ({ state: e, chain: n, range: t }) => {
          const o = C(e);
          !o.isBlockContainer || o.blockContent.node.type.spec.content !== "inline*" || o.blockNoteType === "heading" || n().command(
            O(o.bnBlock.beforePos, {
              type: "bulletListItem",
              props: {}
            })
          ).deleteRange({ from: t.from, to: t.to });
        }
      })
    ];
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => Ze(this.options.editor),
      "Mod-Shift-8": () => {
        const e = C(this.editor.state);
        return !e.isBlockContainer || e.blockContent.node.type.spec.content !== "inline*" ? !0 : this.editor.commands.command(
          O(e.bnBlock.beforePos, {
            type: "bulletListItem",
            props: {}
          })
        );
      }
    };
  },
  parseHTML() {
    return [
      // Parse from internal HTML.
      {
        tag: "div[data-content-type=" + this.name + "]",
        contentElement: ".bn-inline-content"
      },
      // Parse from external HTML.
      {
        tag: "li",
        getAttrs: (e) => {
          var t;
          if (typeof e == "string")
            return !1;
          const n = e.parentElement;
          return n === null ? !1 : n.tagName === "UL" || n.tagName === "DIV" && ((t = n.parentElement) == null ? void 0 : t.tagName) === "UL" ? {} : !1;
        },
        // As `li` elements can contain multiple paragraphs, we need to merge their contents
        // into a single one so that ProseMirror can parse everything correctly.
        getContent: (e, n) => Qe(e, n, this.name),
        node: "bulletListItem"
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    var n, t;
    return $(
      this.name,
      // We use a <p> tag, because for <li> tags we'd need a <ul> element to put
      // them in to be semantically correct, which we can't have due to the
      // schema.
      "p",
      {
        ...((n = this.options.domAttributes) == null ? void 0 : n.blockContent) || {},
        ...e
      },
      ((t = this.options.domAttributes) == null ? void 0 : t.inlineContent) || {}
    );
  }
}), xs = J(
  Bs,
  Es
), Vn = {
  ...M,
  checked: {
    default: !1
  }
}, Ms = j({
  name: "checkListItem",
  content: "inline*",
  group: "blockContent",
  addAttributes() {
    return ke(Vn);
  },
  addInputRules() {
    return [
      // Creates a checklist when starting with "[]" or "[X]".
      new le({
        find: new RegExp("\\[\\s*\\]\\s$"),
        handler: ({ state: e, chain: n, range: t }) => {
          const o = C(e);
          !o.isBlockContainer || o.blockContent.node.type.spec.content !== "inline*" || n().command(
            O(o.bnBlock.beforePos, {
              type: "checkListItem",
              props: {
                checked: !1
              }
            })
          ).deleteRange({ from: t.from, to: t.to });
        }
      }),
      new le({
        find: new RegExp("\\[[Xx]\\]\\s$"),
        handler: ({ state: e, chain: n, range: t }) => {
          const o = C(e);
          !o.isBlockContainer || o.blockContent.node.type.spec.content !== "inline*" || n().command(
            O(o.bnBlock.beforePos, {
              type: "checkListItem",
              props: {
                checked: !0
              }
            })
          ).deleteRange({ from: t.from, to: t.to });
        }
      })
    ];
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => Ze(this.options.editor),
      "Mod-Shift-9": () => {
        const e = C(this.editor.state);
        return !e.isBlockContainer || e.blockContent.node.type.spec.content !== "inline*" ? !0 : this.editor.commands.command(
          O(e.bnBlock.beforePos, {
            type: "checkListItem",
            props: {}
          })
        );
      }
    };
  },
  parseHTML() {
    return [
      // Parse from internal HTML.
      {
        tag: "div[data-content-type=" + this.name + "]",
        contentElement: ".bn-inline-content"
      },
      // Parse from external HTML.
      {
        tag: "input",
        getAttrs: (e) => typeof e == "string" || e.closest("[data-content-type]") || e.closest("li") ? !1 : e.type === "checkbox" ? { checked: e.checked } : !1,
        node: "checkListItem"
      },
      {
        tag: "li",
        getAttrs: (e) => {
          var t;
          if (typeof e == "string")
            return !1;
          const n = e.parentElement;
          if (n === null)
            return !1;
          if (n.tagName === "UL" || n.tagName === "DIV" && ((t = n.parentElement) == null ? void 0 : t.tagName) === "UL") {
            const o = e.querySelector(
              "input[type=checkbox]"
            ) || null;
            return o === null ? !1 : { checked: o.checked };
          }
          return !1;
        },
        // As `li` elements can contain multiple paragraphs, we need to merge their contents
        // into a single one so that ProseMirror can parse everything correctly.
        getContent: (e, n) => Qe(e, n, this.name),
        node: "checkListItem"
      }
    ];
  },
  // Since there is no HTML checklist element, there isn't really any
  // standardization for what checklists should look like in the DOM. GDocs'
  // and Notion's aren't cross compatible, for example. This implementation
  // has a semantically correct DOM structure (though missing a label for the
  // checkbox) which is also converted correctly to Markdown by remark.
  renderHTML({ node: e, HTMLAttributes: n }) {
    var s, i;
    const t = document.createElement("input");
    t.type = "checkbox", t.checked = e.attrs.checked, e.attrs.checked && t.setAttribute("checked", "");
    const { dom: o, contentDOM: r } = $(
      this.name,
      "p",
      {
        ...((s = this.options.domAttributes) == null ? void 0 : s.blockContent) || {},
        ...n
      },
      ((i = this.options.domAttributes) == null ? void 0 : i.inlineContent) || {}
    );
    return o.insertBefore(t, r), { dom: o, contentDOM: r };
  },
  // Need to render node view since the checkbox needs to be able to update the
  // node. This is only possible with a node view as it exposes `getPos`.
  addNodeView() {
    return ({ node: e, getPos: n, editor: t, HTMLAttributes: o }) => {
      var d, u;
      const r = document.createElement("div"), s = document.createElement("div");
      s.contentEditable = "false";
      const i = document.createElement("input");
      i.type = "checkbox", i.checked = e.attrs.checked, e.attrs.checked && i.setAttribute("checked", "");
      const a = () => {
        if (!t.isEditable) {
          i.checked = !i.checked;
          return;
        }
        if (typeof n != "boolean") {
          const h = ee(
            t.state.doc,
            n()
          );
          if (h.node.type.name !== "blockContainer")
            throw new Error(
              `Expected blockContainer node, got ${h.node.type.name}`
            );
          this.editor.commands.command(
            O(h.posBeforeNode, {
              type: "checkListItem",
              props: {
                checked: i.checked
              }
            })
          );
        }
      };
      i.addEventListener("change", a);
      const { dom: c, contentDOM: l } = $(
        this.name,
        "p",
        {
          ...((d = this.options.domAttributes) == null ? void 0 : d.blockContent) || {},
          ...o
        },
        ((u = this.options.domAttributes) == null ? void 0 : u.inlineContent) || {}
      );
      if (typeof n != "boolean") {
        const f = "label-" + this.editor.state.doc.resolve(n()).node().attrs.id;
        i.setAttribute("aria-labelledby", f), l.id = f;
      }
      return c.removeChild(l), c.appendChild(r), r.appendChild(s), r.appendChild(l), s.appendChild(i), {
        dom: c,
        contentDOM: l,
        destroy: () => {
          i.removeEventListener("change", a);
        }
      };
    };
  }
}), Ts = J(
  Ms,
  Vn
), Ps = new V("numbered-list-indexing"), Is = () => new I({
  key: Ps,
  appendTransaction: (e, n, t) => {
    const o = t.tr;
    o.setMeta("numberedListIndexing", !0);
    let r = !1;
    return t.doc.descendants((s, i) => {
      var a;
      if (s.type.name === "blockContainer" && s.firstChild.type.name === "numberedListItem") {
        let c = `${s.firstChild.attrs.start || 1}`;
        const l = Y({
          posBeforeNode: i,
          node: s
        });
        if (!l.isBlockContainer)
          throw new Error("impossible");
        const d = o.doc.resolve(
          l.bnBlock.beforePos
        ).nodeBefore;
        if (d) {
          const m = Y({
            posBeforeNode: l.bnBlock.beforePos - d.nodeSize,
            node: d
          });
          if (m.blockNoteType === "numberedListItem") {
            if (!m.isBlockContainer)
              throw new Error("impossible");
            const b = m.blockContent.node.attrs.index;
            c = (parseInt(b) + 1).toString();
          }
        }
        const u = l.blockContent.node, h = u.attrs.index, f = ((a = d == null ? void 0 : d.firstChild) == null ? void 0 : a.type.name) !== "numberedListItem";
        if (h !== c || u.attrs.start && !f) {
          r = !0;
          const { start: m, ...g } = u.attrs;
          o.setNodeMarkup(l.blockContent.beforePos, void 0, {
            ...g,
            index: c,
            ...typeof m == "number" && f && {
              start: m
            }
          });
        }
      }
    }), r ? o : null;
  }
}), _n = {
  ...M,
  start: { default: void 0, type: "number" }
}, Ls = j({
  name: "numberedListItem",
  content: "inline*",
  group: "blockContent",
  priority: 90,
  addAttributes() {
    return {
      ...ke(_n),
      // the index attribute is only used internally (it's not part of the blocknote schema)
      // that's why it's defined explicitly here, and not part of the prop schema
      index: {
        default: null,
        parseHTML: (e) => e.getAttribute("data-index"),
        renderHTML: (e) => ({
          "data-index": e.index
        })
      }
    };
  },
  addInputRules() {
    return [
      // Creates an ordered list when starting with "1.".
      new le({
        find: new RegExp("^(\\d+)\\.\\s$"),
        handler: ({ state: e, chain: n, range: t, match: o }) => {
          const r = C(e);
          if (!r.isBlockContainer || r.blockContent.node.type.spec.content !== "inline*" || r.blockNoteType === "numberedListItem" || r.blockNoteType === "heading")
            return;
          const s = parseInt(o[1]);
          n().command(
            O(r.bnBlock.beforePos, {
              type: "numberedListItem",
              props: s === 1 && {} || {
                start: s
              }
            })
          ).deleteRange({ from: t.from, to: t.to });
        }
      })
    ];
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => Ze(this.options.editor),
      "Mod-Shift-7": () => {
        const e = C(this.editor.state);
        return !e.isBlockContainer || e.blockContent.node.type.spec.content !== "inline*" ? !0 : this.editor.commands.command(
          O(e.bnBlock.beforePos, {
            type: "numberedListItem",
            props: {}
          })
        );
      }
    };
  },
  addProseMirrorPlugins() {
    return [Is()];
  },
  parseHTML() {
    return [
      // Parse from internal HTML.
      {
        tag: "div[data-content-type=" + this.name + "]",
        contentElement: ".bn-inline-content"
      },
      // Parse from external HTML.
      {
        tag: "li",
        getAttrs: (e) => {
          var t;
          if (typeof e == "string")
            return !1;
          const n = e.parentElement;
          if (n === null)
            return !1;
          if (n.tagName === "OL" || n.tagName === "DIV" && ((t = n.parentElement) == null ? void 0 : t.tagName) === "OL") {
            const o = parseInt(n.getAttribute("start") || "1") || 1;
            return e.previousSibling || o === 1 ? {} : {
              start: o
            };
          }
          return !1;
        },
        // As `li` elements can contain multiple paragraphs, we need to merge their contents
        // into a single one so that ProseMirror can parse everything correctly.
        getContent: (e, n) => Qe(e, n, this.name),
        priority: 300,
        node: "numberedListItem"
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    var n, t;
    return $(
      this.name,
      // We use a <p> tag, because for <li> tags we'd need an <ol> element to
      // put them in to be semantically correct, which we can't have due to the
      // schema.
      "p",
      {
        ...((n = this.options.domAttributes) == null ? void 0 : n.blockContent) || {},
        ...e
      },
      ((t = this.options.domAttributes) == null ? void 0 : t.inlineContent) || {}
    );
  }
}), As = J(
  Ls,
  _n
), Ns = {
  ...M
}, Hs = j({
  name: "paragraph",
  content: "inline*",
  group: "blockContent",
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-0": () => {
        const e = C(this.editor.state);
        return !e.isBlockContainer || e.blockContent.node.type.spec.content !== "inline*" ? !0 : this.editor.commands.command(
          O(e.bnBlock.beforePos, {
            type: "paragraph",
            props: {}
          })
        );
      }
    };
  },
  parseHTML() {
    return [
      // Parse from internal HTML.
      {
        tag: "div[data-content-type=" + this.name + "]",
        contentElement: ".bn-inline-content"
      },
      // Parse from external HTML.
      {
        tag: "p",
        getAttrs: (e) => {
          var n;
          return typeof e == "string" || !((n = e.textContent) != null && n.trim()) ? !1 : {};
        },
        node: "paragraph"
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    var n, t;
    return $(
      this.name,
      "p",
      {
        ...((n = this.options.domAttributes) == null ? void 0 : n.blockContent) || {},
        ...e
      },
      ((t = this.options.domAttributes) == null ? void 0 : t.inlineContent) || {}
    );
  }
}), Ds = J(
  Hs,
  Ns
), Os = {
  ...M
}, Rs = j({
  name: "quote",
  content: "inline*",
  group: "blockContent",
  addInputRules() {
    return [
      // Creates a block quote when starting with ">".
      new le({
        find: new RegExp("^>\\s$"),
        handler: ({ state: e, chain: n, range: t }) => {
          const o = C(e);
          !o.isBlockContainer || o.blockContent.node.type.spec.content !== "inline*" || n().command(
            O(o.bnBlock.beforePos, {
              type: "quote",
              props: {}
            })
          ).deleteRange({ from: t.from, to: t.to });
        }
      })
    ];
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-q": () => {
        const e = C(this.editor.state);
        return !e.isBlockContainer || e.blockContent.node.type.spec.content !== "inline*" ? !0 : this.editor.commands.command(
          O(e.bnBlock.beforePos, {
            type: "quote"
          })
        );
      }
    };
  },
  parseHTML() {
    return [
      // Parse from internal HTML.
      {
        tag: "div[data-content-type=" + this.name + "]",
        contentElement: ".bn-inline-content"
      },
      // Parse from external HTML.
      {
        tag: "blockquote",
        node: "quote",
        getContent: (e, n) => {
          const o = e.cloneNode(!0);
          return pr(o), Be.fromSchema(n).parse(o, {
            topNode: n.nodes.paragraph.create()
          }).content;
        }
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    var n, t;
    return $(
      this.name,
      "blockquote",
      {
        ...((n = this.options.domAttributes) == null ? void 0 : n.blockContent) || {},
        ...e
      },
      ((t = this.options.domAttributes) == null ? void 0 : t.inlineContent) || {}
    );
  }
}), Vs = J(
  Rs,
  Os
), _s = 35, Un = 120, Kc = 31, Us = U.create({
  name: "BlockNoteTableExtension",
  addProseMirrorPlugins: () => [
    No({
      cellMinWidth: _s,
      defaultCellMinWidth: Un,
      // We set this to null as we implement our own node view in the table
      // block content. This node view is the same as what's used by default,
      // but is wrapped in a `blockContent` HTML element.
      View: null
    }),
    Ho()
  ],
  addKeyboardShortcuts() {
    return {
      // Makes enter create a new line within the cell.
      Enter: () => this.editor.state.selection.empty && this.editor.state.selection.$head.parent.type.name === "tableParagraph" ? (this.editor.commands.insertContent({ type: "hardBreak" }), !0) : !1,
      // Ensures that backspace won't delete the table if the text cursor is at
      // the start of a cell and the selection is empty.
      Backspace: () => {
        const e = this.editor.state.selection, n = e.empty, t = e.$head.parentOffset === 0, o = e.$head.node().type.name === "tableParagraph";
        return n && t && o;
      },
      // Enables navigating cells using the tab key.
      Tab: () => this.editor.commands.command(
        ({ state: e, dispatch: n, view: t }) => Ht(1)(e, n, t)
      ),
      "Shift-Tab": () => this.editor.commands.command(
        ({ state: e, dispatch: n, view: t }) => Ht(-1)(e, n, t)
      )
    };
  },
  extendNodeSchema(e) {
    const n = {
      name: e.name,
      options: e.options,
      storage: e.storage
    };
    return {
      tableRole: go(
        bo(e, "tableRole", n)
      )
    };
  }
}), $s = {
  textColor: M.textColor
}, Fs = j({
  name: "table",
  content: "tableRow+",
  group: "blockContent",
  tableRole: "table",
  marks: "deletion insertion modification",
  isolating: !0,
  parseHTML() {
    return [
      {
        tag: "table"
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    var n, t;
    return $(
      this.name,
      "table",
      {
        ...((n = this.options.domAttributes) == null ? void 0 : n.blockContent) || {},
        ...e
      },
      ((t = this.options.domAttributes) == null ? void 0 : t.inlineContent) || {}
    );
  },
  // This node view is needed for the `columnResizing` plugin. By default, the
  // plugin adds its own node view, which overrides how the node is rendered vs
  // `renderHTML`. This means that the wrapping `blockContent` HTML element is
  // no longer rendered. The `columnResizing` plugin uses the `TableView` as its
  // default node view. `BlockNoteTableView` extends it by wrapping it in a
  // `blockContent` element, so the DOM structure is consistent with other block
  // types.
  addNodeView() {
    return ({ node: e, HTMLAttributes: n }) => {
      var o;
      class t extends Do {
        constructor(s, i, a) {
          super(s, i), this.node = s, this.cellMinWidth = i, this.blockContentHTMLAttributes = a;
          const c = document.createElement("div");
          c.className = ne(
            "bn-block-content",
            a.class
          ), c.setAttribute("data-content-type", "table");
          for (const [h, f] of Object.entries(
            a
          ))
            h !== "class" && c.setAttribute(h, f);
          const l = this.dom, d = document.createElement("div");
          d.className = "tableWrapper-inner", d.appendChild(l.firstChild), l.appendChild(d), c.appendChild(l);
          const u = document.createElement("div");
          u.className = "table-widgets-container", u.style.position = "relative", l.appendChild(u), this.dom = c;
        }
        ignoreMutation(s) {
          return !s.target.closest(".tableWrapper-inner") || super.ignoreMutation(s);
        }
      }
      return new t(e, Un, {
        ...((o = this.options.domAttributes) == null ? void 0 : o.blockContent) || {},
        ...n
      });
    };
  }
}), zs = j({
  name: "tableParagraph",
  group: "tableContent",
  content: "inline*",
  parseHTML() {
    return [
      {
        tag: "p",
        getAttrs: (e) => {
          if (typeof e == "string" || !e.textContent || !e.closest("[data-content-type]"))
            return !1;
          const n = e.parentElement;
          return n === null ? !1 : n.tagName === "TD" || n.tagName === "TH" ? {} : !1;
        },
        node: "tableParagraph"
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    return ["p", e, 0];
  }
}), Ws = oe.create({
  name: "tableRow",
  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },
  content: "(tableCell | tableHeader)+",
  tableRole: "row",
  marks: "deletion insertion modification",
  parseHTML() {
    return [{ tag: "tr" }];
  },
  renderHTML({ HTMLAttributes: e }) {
    return [
      "tr",
      bt(this.options.HTMLAttributes, e),
      0
    ];
  }
});
function qt(e, n) {
  const o = Be.fromSchema(n).parse(e, {
    topNode: n.nodes.blockGroup.create()
  }), r = [];
  return o.content.descendants((s) => {
    if (s.isInline)
      return r.push(s), !1;
  }), R.fromArray(r);
}
const js = J(
  Fs,
  $s,
  [
    Us,
    zs,
    Ao.extend({
      /**
       * We allow table headers and cells to have multiple tableContent nodes because
       * when merging cells, prosemirror-tables will concat the contents of the cells naively.
       * This would cause that content to overflow into other cells when prosemirror tries to enforce the cell structure.
       *
       * So, we manually fix this up when reading back in the `nodeToBlock` and only ever place a single tableContent back into the cell.
       */
      content: "tableContent+",
      parseHTML() {
        return [
          {
            tag: "th",
            // As `th` elements can contain multiple paragraphs, we need to merge their contents
            // into a single one so that ProseMirror can parse everything correctly.
            getContent: (e, n) => qt(e, n)
          }
        ];
      }
    }),
    Lo.extend({
      content: "tableContent+",
      parseHTML() {
        return [
          {
            tag: "td",
            // As `td` elements can contain multiple paragraphs, we need to merge their contents
            // into a single one so that ProseMirror can parse everything correctly.
            getContent: (e, n) => qt(e, n)
          }
        ];
      }
    }),
    Ws
  ]
), Kt = (e) => {
  const n = e.src || void 0, t = e.width || void 0;
  return { url: n, previewWidth: t };
}, Gs = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.44495 22 3.9934V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V3.9934ZM8 5V19H16V5H8ZM4 5V7H6V5H4ZM18 5V7H20V5H18ZM4 9V11H6V9H4ZM18 9V11H20V9H18ZM4 13V15H6V13H4ZM18 13V15H20V13H18ZM4 17V19H6V17H4ZM18 17V19H20V17H18Z"></path></svg>', qs = {
  textAlignment: M.textAlignment,
  backgroundColor: M.backgroundColor,
  // File name.
  name: {
    default: ""
  },
  // File url.
  url: {
    default: ""
  },
  // File caption.
  caption: {
    default: ""
  },
  showPreview: {
    default: !0
  },
  // File preview width in px.
  previewWidth: {
    default: void 0,
    type: "number"
  }
}, Ks = {
  type: "video",
  propSchema: qs,
  content: "none",
  isFileBlock: !0,
  fileBlockAccept: ["video/*"]
}, Ys = (e, n) => {
  const t = document.createElement("div");
  t.innerHTML = Gs;
  const o = document.createElement("div");
  o.className = "bn-visual-media-wrapper";
  const r = document.createElement("video");
  return r.className = "bn-visual-media", n.resolveFileUrl ? n.resolveFileUrl(e.props.url).then((s) => {
    r.src = s;
  }) : r.src = e.props.url, r.controls = !0, r.contentEditable = "false", r.draggable = !1, r.width = e.props.previewWidth, o.appendChild(r), On(
    e,
    n,
    { dom: o },
    o,
    n.dictionary.file_blocks.video.add_button_text,
    t.firstElementChild
  );
}, Js = (e) => {
  if (e.tagName === "VIDEO")
    return e.closest("figure") ? void 0 : Kt(e);
  if (e.tagName === "FIGURE") {
    const n = Je(e, "video");
    if (!n)
      return;
    const { targetElement: t, caption: o } = n;
    return {
      ...Kt(t),
      caption: o
    };
  }
}, Xs = (e) => {
  if (!e.props.url) {
    const t = document.createElement("p");
    return t.textContent = "Add video", {
      dom: t
    };
  }
  let n;
  return e.props.showPreview ? (n = document.createElement("video"), n.src = e.props.url, e.props.previewWidth && (n.width = e.props.previewWidth)) : (n = document.createElement("a"), n.href = e.props.url, n.textContent = e.props.name || e.props.url), e.props.caption ? e.props.showPreview ? Mt(n, e.props.caption) : Xe(n, e.props.caption) : {
    dom: n
  };
}, Zs = Me(Ks, {
  render: Ys,
  parse: Js,
  toExternalHTML: Xs
}), Qs = new V("custom-list-indexing"), ei = () => new I({
  key: Qs,
  appendTransaction: (e, n, t) => {
    const o = t.tr;
    o.setMeta("customListIndexing", !0);
    let r = !1;
    return t.doc.descendants((s, i) => {
      var a;
      if (s.type.name === "blockContainer" && s.firstChild.type.name === "customListItem") {
        let c = `${s.firstChild.attrs.start || 1}`;
        const l = Y({
          posBeforeNode: i,
          node: s
        });
        if (!l.isBlockContainer)
          throw new Error("impossible");
        const d = o.doc.resolve(
          l.bnBlock.beforePos
        ).nodeBefore;
        if (d) {
          const m = Y({
            posBeforeNode: l.bnBlock.beforePos - d.nodeSize,
            node: d
          });
          if (m.blockNoteType === "customListItem") {
            if (!m.isBlockContainer)
              throw new Error("impossible");
            const b = m.blockContent.node.attrs.index;
            c = (parseInt(b) + 1).toString();
          }
        }
        const u = l.blockContent.node, h = u.attrs.index, f = ((a = d == null ? void 0 : d.firstChild) == null ? void 0 : a.type.name) !== "customListItem";
        if (h !== c || u.attrs.start && !f) {
          r = !0;
          const { start: m, ...g } = u.attrs;
          o.setNodeMarkup(l.blockContent.beforePos, void 0, {
            ...g,
            index: c,
            ...typeof m == "number" && f && {
              start: m
            }
          });
        }
      }
    }), r ? o : null;
  }
}), $n = {
  ...M,
  start: { default: void 0, type: "number" },
  prefix: { default: 0 }
  // 左側前綴
}, ti = j({
  name: "customListItem",
  content: "inline*",
  group: "blockContent",
  priority: 89,
  addAttributes() {
    return {
      ...ke($n),
      index: {
        default: 1,
        parseHTML: (e) => e.getAttribute("data-index"),
        renderHTML: (e) => ({ "data-index": e.index })
      },
      prefix: {
        default: 0,
        parseHTML: (e) => Number(e.getAttribute("data-prefix")) || 0,
        renderHTML: (e) => ({ "data-prefix": e.prefix ?? 0 })
      }
    };
  },
  addProseMirrorPlugins() {
    return [ei()];
  },
  parseHTML() {
    return [
      {
        tag: `div[data-content-type=${this.name}]`,
        contentElement: ".bn-inline-content"
      },
      {
        tag: "li",
        getAttrs: (e) => ({
          index: e.getAttribute("data-index") || 1,
          prefix: e.getAttribute("data-prefix") || 0
        }),
        getContent: (e, n) => Qe(e, n, this.name),
        priority: 300,
        node: "customListItem"
      }
    ];
  },
  renderHTML({ node: e, HTMLAttributes: n }) {
    var t, o;
    return console.log(e.attrs), $(
      this.name,
      "p",
      {
        ...((t = this.options.domAttributes) == null ? void 0 : t.blockContent) || {},
        ...n
      },
      ((o = this.options.domAttributes) == null ? void 0 : o.inlineContent) || {}
    );
  }
}), ni = J(
  ti,
  $n
), Fn = {
  paragraph: Ds,
  heading: hs,
  quote: Vs,
  codeBlock: Qr,
  toggleListItem: Ss,
  bulletListItem: xs,
  numberedListItem: As,
  checkListItem: Ts,
  customListItem: ni,
  table: js,
  file: ls,
  image: ys,
  video: Zs,
  audio: Jr
}, oi = bn(Fn), zn = {
  bold: ae(xo, "boolean"),
  italic: ae(To, "boolean"),
  underline: ae(Io, "boolean"),
  strike: ae(Po, "boolean"),
  code: ae(Mo, "boolean"),
  textColor: os,
  backgroundColor: ts
}, Yc = vn(zn), Wn = {
  text: { config: "text", implementation: {} },
  link: { config: "link", implementation: {} }
}, ri = yn(
  Wn
);
function D(e, n) {
  return e in n.schema.blockSchema && n.schema.blockSchema[e] === oi[e];
}
function Jc(e, n, t) {
  return e in t.schema.blockSchema && t.schema.blockSchema[e] === n;
}
function si(e, n) {
  return e in n.schema.inlineContentSchema && n.schema.inlineContentSchema[e] === ri[e];
}
function Xc(e, n, t) {
  return e in t.schema.inlineContentSchema && t.schema.inlineContentSchema[e] === n;
}
function ii(e, n, t) {
  return n.type === e && n.type in t.schema.blockSchema && D(n.type, t);
}
function Zc(e, n) {
  return e.type in n.schema.blockSchema && n.schema.blockSchema[e.type].isFileBlock || !1;
}
function Qc(e, n) {
  return e.type in n.schema.blockSchema && n.schema.blockSchema[e.type].isFileBlock && "showPreview" in n.schema.blockSchema[e.type].propSchema || !1;
}
function el(e, n) {
  return n.schema.blockSchema[e.type].isFileBlock && !e.props.url;
}
function ai(e, n, t) {
  return n in t.schema.blockSchema && e in t.schema.blockSchema[n].propSchema && t.schema.blockSchema[n].propSchema[e] === M[e];
}
function tl(e, n, t) {
  return ai(e, n.type, t);
}
function Yt(e) {
  return e instanceof xe;
}
const nl = async (e) => {
  const n = new FormData();
  return n.append("file", e), (await (await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: n
  })).json()).data.url.replace(
    "tmpfiles.org/",
    "tmpfiles.org/dl/"
  );
};
function ci(e) {
  let n = e.getTextCursorPosition().block, t = e.schema.blockSchema[n.type].content;
  for (; t === "none"; ) {
    if (n = e.getTextCursorPosition().nextBlock, n === void 0)
      return;
    t = e.schema.blockSchema[n.type].content, e.setTextCursorPosition(n, "end");
  }
}
function P(e, n) {
  const t = e.getTextCursorPosition().block;
  if (t.content === void 0)
    throw new Error("Slash Menu open in a block that doesn't contain content.");
  let o;
  return Array.isArray(t.content) && (t.content.length === 1 && ue(t.content[0]) && t.content[0].type === "text" && t.content[0].text === "/" || t.content.length === 0) ? (o = e.updateBlock(t, n), e.setTextCursorPosition(o)) : (o = e.insertBlocks([n], t, "after")[0], e.setTextCursorPosition(e.getTextCursorPosition().nextBlock)), ci(e), o;
}
function ol(e) {
  const n = [];
  return D("heading", e) && n.push(
    {
      onItemClick: () => {
        P(e, {
          type: "heading",
          props: { level: 1 }
        });
      },
      badge: X("Mod-Alt-1"),
      key: "heading",
      ...e.dictionary.slash_menu.heading
    },
    {
      onItemClick: () => {
        P(e, {
          type: "heading",
          props: { level: 2 }
        });
      },
      badge: X("Mod-Alt-2"),
      key: "heading_2",
      ...e.dictionary.slash_menu.heading_2
    },
    {
      onItemClick: () => {
        P(e, {
          type: "heading",
          props: { level: 3 }
        });
      },
      badge: X("Mod-Alt-3"),
      key: "heading_3",
      ...e.dictionary.slash_menu.heading_3
    }
  ), D("quote", e) && n.push({
    onItemClick: () => {
      P(e, {
        type: "quote"
      });
    },
    key: "quote",
    ...e.dictionary.slash_menu.quote
  }), D("toggleListItem", e) && n.push({
    onItemClick: () => {
      P(e, {
        type: "toggleListItem"
      });
    },
    badge: X("Mod-Shift-6"),
    key: "toggle_list",
    ...e.dictionary.slash_menu.toggle_list
  }), D("numberedListItem", e) && n.push({
    onItemClick: () => {
      P(e, {
        type: "numberedListItem"
      });
    },
    badge: X("Mod-Shift-7"),
    key: "numbered_list",
    ...e.dictionary.slash_menu.numbered_list
  }), D("bulletListItem", e) && n.push({
    onItemClick: () => {
      P(e, {
        type: "bulletListItem"
      });
    },
    badge: X("Mod-Shift-8"),
    key: "bullet_list",
    ...e.dictionary.slash_menu.bullet_list
  }), D("checkListItem", e) && n.push({
    onItemClick: () => {
      P(e, {
        type: "checkListItem"
      });
    },
    badge: X("Mod-Shift-9"),
    key: "check_list",
    ...e.dictionary.slash_menu.check_list
  }), D("paragraph", e) && n.push({
    onItemClick: () => {
      P(e, {
        type: "paragraph"
      });
    },
    badge: X("Mod-Alt-0"),
    key: "paragraph",
    ...e.dictionary.slash_menu.paragraph
  }), D("codeBlock", e) && n.push({
    onItemClick: () => {
      P(e, {
        type: "codeBlock"
      });
    },
    badge: X("Mod-Alt-c"),
    key: "code_block",
    ...e.dictionary.slash_menu.code_block
  }), D("table", e) && n.push({
    onItemClick: () => {
      P(e, {
        type: "table",
        content: {
          type: "tableContent",
          rows: [
            {
              cells: ["", "", ""]
            },
            {
              cells: ["", "", ""]
            }
          ]
        }
      });
    },
    badge: void 0,
    key: "table",
    ...e.dictionary.slash_menu.table
  }), D("image", e) && n.push({
    onItemClick: () => {
      const t = P(e, {
        type: "image"
      });
      e.transact(
        (o) => o.setMeta(e.filePanel.plugins[0], {
          block: t
        })
      );
    },
    key: "image",
    ...e.dictionary.slash_menu.image
  }), D("video", e) && n.push({
    onItemClick: () => {
      const t = P(e, {
        type: "video"
      });
      e.transact(
        (o) => o.setMeta(e.filePanel.plugins[0], {
          block: t
        })
      );
    },
    key: "video",
    ...e.dictionary.slash_menu.video
  }), D("audio", e) && n.push({
    onItemClick: () => {
      const t = P(e, {
        type: "audio"
      });
      e.transact(
        (o) => o.setMeta(e.filePanel.plugins[0], {
          block: t
        })
      );
    },
    key: "audio",
    ...e.dictionary.slash_menu.audio
  }), D("file", e) && n.push({
    onItemClick: () => {
      const t = P(e, {
        type: "file"
      });
      e.transact(
        (o) => o.setMeta(e.filePanel.plugins[0], {
          block: t
        })
      );
    },
    key: "file",
    ...e.dictionary.slash_menu.file
  }), D("heading", e) && (n.push(
    {
      onItemClick: () => {
        P(e, {
          type: "heading",
          props: { level: 1, isToggleable: !0 }
        });
      },
      key: "toggle_heading",
      ...e.dictionary.slash_menu.toggle_heading
    },
    {
      onItemClick: () => {
        P(e, {
          type: "heading",
          props: { level: 2, isToggleable: !0 }
        });
      },
      key: "toggle_heading_2",
      ...e.dictionary.slash_menu.toggle_heading_2
    },
    {
      onItemClick: () => {
        P(e, {
          type: "heading",
          props: { level: 3, isToggleable: !0 }
        });
      },
      key: "toggle_heading_3",
      ...e.dictionary.slash_menu.toggle_heading_3
    }
  ), e.settings.heading.levels.filter((t) => t > 3).forEach((t) => {
    n.push({
      onItemClick: () => {
        P(e, {
          type: "heading",
          props: { level: t }
        });
      },
      key: `heading_${t}`,
      ...e.dictionary.slash_menu[`heading_${t}`]
    });
  })), n.push({
    onItemClick: () => {
      e.openSuggestionMenu(":", {
        deleteTriggerCharacter: !0,
        ignoreQueryLength: !0
      });
    },
    key: "emoji",
    ...e.dictionary.slash_menu.emoji
  }), n;
}
function rl(e, n) {
  return e.filter(
    ({ title: t, aliases: o }) => t.toLowerCase().includes(n.toLowerCase()) || o && o.filter(
      (r) => r.toLowerCase().includes(n.toLowerCase())
    ).length !== 0
  );
}
function nt(e) {
  return e && Object.fromEntries(
    Object.entries(e).filter(([, n]) => n !== void 0)
  );
}
class Ie {
  constructor(n) {
    p(this, "blockSpecs");
    p(this, "inlineContentSpecs");
    p(this, "styleSpecs");
    p(this, "blockSchema");
    p(this, "inlineContentSchema");
    p(this, "styleSchema");
    // Helper so that you can use typeof schema.BlockNoteEditor
    p(this, "BlockNoteEditor", "only for types");
    p(this, "Block", "only for types");
    p(this, "PartialBlock", "only for types");
    this.blockSpecs = nt(n == null ? void 0 : n.blockSpecs) || Fn, this.inlineContentSpecs = nt(n == null ? void 0 : n.inlineContentSpecs) || Wn, this.styleSpecs = nt(n == null ? void 0 : n.styleSpecs) || zn, this.blockSchema = bn(this.blockSpecs), this.inlineContentSchema = yn(
      this.inlineContentSpecs
    ), this.styleSchema = vn(this.styleSpecs);
  }
  static create(n) {
    return new Ie(n);
  }
}
const li = {
  type: "pageBreak",
  propSchema: {},
  content: "none",
  isFileBlock: !1,
  isSelectable: !1
}, di = () => {
  const e = document.createElement("div");
  return e.className = "bn-page-break", e.setAttribute("data-page-break", ""), {
    dom: e
  };
}, ui = (e) => {
  if (e.tagName === "DIV" && e.hasAttribute("data-page-break"))
    return {
      type: "pageBreak"
    };
}, pi = () => {
  const e = document.createElement("div");
  return e.setAttribute("data-page-break", ""), {
    dom: e
  };
}, hi = Me(li, {
  render: di,
  parse: ui,
  toExternalHTML: pi
}), jn = Ie.create({
  blockSpecs: {
    pageBreak: hi
  }
}), sl = (e) => Ie.create({
  blockSpecs: {
    ...e.blockSpecs,
    ...jn.blockSpecs
  },
  inlineContentSpecs: e.inlineContentSpecs,
  styleSpecs: e.styleSpecs
});
function fi(e) {
  return "pageBreak" in e.schema.blockSchema && e.schema.blockSchema.pageBreak === jn.blockSchema.pageBreak;
}
function il(e) {
  const n = [];
  return fi(e) && n.push({
    ...e.dictionary.slash_menu.page_break,
    onItemClick: () => {
      P(e, {
        type: "pageBreak"
      });
    },
    key: "page_break"
  }), n;
}
function mi(e) {
  return e.transact((n) => {
    const t = ee(n.doc, n.selection.anchor);
    if (n.selection instanceof xe)
      return {
        type: "cell",
        anchorBlockId: t.node.attrs.id,
        anchorCellOffset: n.selection.$anchorCell.pos - t.posBeforeNode,
        headCellOffset: n.selection.$headCell.pos - t.posBeforeNode
      };
    if (n.selection instanceof be)
      return {
        type: "node",
        anchorBlockId: t.node.attrs.id
      };
    {
      const o = ee(n.doc, n.selection.head);
      return {
        type: "text",
        anchorBlockId: t.node.attrs.id,
        headBlockId: o.node.attrs.id,
        anchorOffset: n.selection.anchor - t.posBeforeNode,
        headOffset: n.selection.head - o.posBeforeNode
      };
    }
  });
}
function gi(e, n) {
  var r, s;
  const t = (r = F(n.anchorBlockId, e.doc)) == null ? void 0 : r.posBeforeNode;
  if (t === void 0)
    throw new Error(
      `Could not find block with ID ${n.anchorBlockId} to update selection`
    );
  let o;
  if (n.type === "cell")
    o = xe.create(
      e.doc,
      t + n.anchorCellOffset,
      t + n.headCellOffset
    );
  else if (n.type === "node")
    o = be.create(e.doc, t + 1);
  else {
    const i = (s = F(n.headBlockId, e.doc)) == null ? void 0 : s.posBeforeNode;
    if (i === void 0)
      throw new Error(
        `Could not find block with ID ${n.headBlockId} to update selection`
      );
    o = H.create(
      e.doc,
      t + n.anchorOffset,
      i + n.headOffset
    );
  }
  e.setSelection(o);
}
function ht(e) {
  return e.map((n) => n.type === "columnList" ? n.children.map((t) => ht(t.children)).flat() : {
    ...n,
    children: ht(n.children)
  }).flat();
}
function Gn(e, n, t) {
  e.transact((o) => {
    var i;
    const r = ((i = e.getSelection()) == null ? void 0 : i.blocks) || [
      e.getTextCursorPosition().block
    ], s = mi(e);
    e.removeBlocks(r), e.insertBlocks(ht(r), n, t), gi(o, s);
  });
}
function qn(e) {
  return !e || e.type !== "columnList";
}
function Kn(e, n, t) {
  let o, r;
  if (n ? n.children.length > 0 ? (o = n.children[n.children.length - 1], r = "after") : (o = n, r = "before") : t && (o = t, r = "before"), !o || !r)
    return;
  const s = e.getParentBlock(o);
  return qn(s) ? { referenceBlock: o, placement: r } : Kn(
    e,
    r === "after" ? o : e.getPrevBlock(o),
    s
  );
}
function Yn(e, n, t) {
  let o, r;
  if (n ? n.children.length > 0 ? (o = n.children[0], r = "before") : (o = n, r = "after") : t && (o = t, r = "after"), !o || !r)
    return;
  const s = e.getParentBlock(o);
  return qn(s) ? { referenceBlock: o, placement: r } : Yn(
    e,
    r === "before" ? o : e.getNextBlock(o),
    s
  );
}
function bi(e) {
  e.transact(() => {
    const n = e.getSelection(), t = (n == null ? void 0 : n.blocks[0]) || e.getTextCursorPosition().block, o = Kn(
      e,
      e.getPrevBlock(t),
      e.getParentBlock(t)
    );
    o && Gn(
      e,
      o.referenceBlock,
      o.placement
    );
  });
}
function ki(e) {
  e.transact(() => {
    const n = e.getSelection(), t = (n == null ? void 0 : n.blocks[(n == null ? void 0 : n.blocks.length) - 1]) || e.getTextCursorPosition().block, o = Yn(
      e,
      e.getNextBlock(t),
      e.getParentBlock(t)
    );
    o && Gn(
      e,
      o.referenceBlock,
      o.placement
    );
  });
}
function wi(e, n, t) {
  const { $from: o, $to: r } = e.selection, s = o.blockRange(
    r,
    (m) => m.childCount > 0 && (m.type.name === "blockGroup" || m.type.name === "column")
    // change necessary to not look at first item child type
  );
  if (!s)
    return !1;
  const i = s.startIndex;
  if (i === 0)
    return !1;
  const c = s.parent.child(i - 1);
  if (c.type !== n)
    return !1;
  const l = c.lastChild && c.lastChild.type === t, d = R.from(l ? n.create() : null), u = new Z(
    R.from(
      n.create(null, R.from(t.create(null, d)))
      // change necessary to create "groupType" instead of parent.type
    ),
    l ? 3 : 1,
    0
  ), h = s.start, f = s.end;
  return e.step(
    new rt(
      h - (l ? 3 : 1),
      f,
      h,
      f,
      u,
      1,
      !0
    )
  ).scrollIntoView(), !0;
}
function Jn(e) {
  return e.transact((n) => wi(
    n,
    e.pmSchema.nodes.blockContainer,
    e.pmSchema.nodes.blockGroup
  ));
}
function yi(e) {
  e._tiptapEditor.commands.liftListItem("blockContainer");
}
function Ci(e) {
  return e.transact((n) => {
    const { bnBlock: t } = Ge(n);
    return n.doc.resolve(t.beforePos).nodeBefore !== null;
  });
}
function vi(e) {
  return e.transact((n) => {
    const { bnBlock: t } = Ge(n);
    return n.doc.resolve(t.beforePos).depth > 1;
  });
}
function Si(e, n) {
  const t = typeof n == "string" ? n : n.id, o = A(e), r = F(t, e);
  if (r)
    return E(r.node, o);
}
function Ei(e, n) {
  const t = typeof n == "string" ? n : n.id, o = F(t, e), r = A(e);
  if (!o)
    return;
  const i = e.resolve(o.posBeforeNode).nodeBefore;
  if (i)
    return E(i, r);
}
function Bi(e, n) {
  const t = typeof n == "string" ? n : n.id, o = F(t, e), r = A(e);
  if (!o)
    return;
  const i = e.resolve(
    o.posBeforeNode + o.node.nodeSize
  ).nodeAfter;
  if (i)
    return E(i, r);
}
function xi(e, n) {
  const t = typeof n == "string" ? n : n.id, o = A(e), r = F(t, e);
  if (!r)
    return;
  const s = e.resolve(r.posBeforeNode), i = s.node(), a = s.node(-1), c = a.type.name !== "doc" ? i.type.name === "blockGroup" ? a : i : void 0;
  if (c)
    return E(c, o);
}
function Mi(e, n, t, o = { updateSelection: !0 }) {
  let { from: r, to: s } = typeof n == "number" ? { from: n, to: n } : { from: n.from, to: n.to }, i = !0, a = !0, c = "";
  if (t.forEach((l) => {
    l.check(), i && l.isText && l.marks.length === 0 ? c += l.text : i = !1, a = a ? l.isBlock : !1;
  }), r === s && a) {
    const { parent: l } = e.doc.resolve(r);
    l.isTextblock && !l.type.spec.code && !l.childCount && (r -= 1, s += 1);
  }
  return i ? e.insertText(c, r, s) : e.replaceWith(r, s, t), o.updateSelection && ko(e, e.steps.length - 1, -1), !0;
}
function Ti(e) {
  const n = A(e);
  if (e.selection.empty || "node" in e.selection)
    return;
  const t = e.doc.resolve(
    ee(e.doc, e.selection.from).posBeforeNode
  ), o = e.doc.resolve(
    ee(e.doc, e.selection.to).posBeforeNode
  ), r = (l, d) => {
    const u = t.posAtIndex(l, d), h = e.doc.resolve(u).nodeAfter;
    if (!h)
      throw new Error(
        `Error getting selection - node not found at position ${u}`
      );
    return E(h, n);
  }, s = [], i = t.sharedDepth(o.pos), a = t.index(i), c = o.index(i);
  if (t.depth > i) {
    s.push(E(t.nodeAfter, n));
    for (let l = t.depth; l > i; l--)
      if (t.node(l).type.isInGroup("childContainer")) {
        const u = t.index(l) + 1, h = t.node(l).childCount;
        for (let f = u; f < h; f++)
          s.push(r(f, l));
      }
  } else
    s.push(r(a, i));
  for (let l = a + 1; l <= c; l++)
    s.push(r(l, i));
  if (s.length === 0)
    throw new Error(
      `Error getting selection - selection doesn't span any blocks (${e.selection})`
    );
  return {
    blocks: s
  };
}
function Pi(e, n, t) {
  const o = typeof n == "string" ? n : n.id, r = typeof t == "string" ? t : t.id, s = A(e), i = Pe(s);
  if (o === r)
    throw new Error(
      `Attempting to set selection with the same anchor and head blocks (id ${o})`
    );
  const a = F(o, e.doc);
  if (!a)
    throw new Error(`Block with ID ${o} not found`);
  const c = F(r, e.doc);
  if (!c)
    throw new Error(`Block with ID ${r} not found`);
  const l = Y(a), d = Y(c), u = i.blockSchema[l.blockNoteType], h = i.blockSchema[d.blockNoteType];
  if (!l.isBlockContainer || u.content === "none")
    throw new Error(
      `Attempting to set selection anchor in block without content (id ${o})`
    );
  if (!d.isBlockContainer || h.content === "none")
    throw new Error(
      `Attempting to set selection anchor in block without content (id ${r})`
    );
  let f, m;
  if (u.content === "table") {
    const g = Dt.get(l.blockContent.node);
    f = l.blockContent.beforePos + g.positionAt(0, 0, l.blockContent.node) + 1 + 2;
  } else
    f = l.blockContent.beforePos + 1;
  if (h.content === "table") {
    const g = Dt.get(d.blockContent.node), b = d.blockContent.beforePos + g.positionAt(
      g.height - 1,
      g.width - 1,
      d.blockContent.node
    ) + 1, k = e.doc.resolve(b).nodeAfter.nodeSize;
    m = b + k - 2;
  } else
    m = d.blockContent.afterPos - 1;
  e.setSelection(H.create(e.doc, f, m));
}
function Ii(e) {
  const n = A(e);
  let t = e.selection.$from, o = e.selection.$to;
  for (; o.parentOffset >= o.parent.nodeSize - 2 && o.depth > 0; )
    o = e.doc.resolve(o.pos + 1);
  for (; o.parentOffset === 0 && o.depth > 0; )
    o = e.doc.resolve(o.pos - 1);
  for (; t.parentOffset === 0 && t.depth > 0; )
    t = e.doc.resolve(t.pos - 1);
  for (; t.parentOffset >= t.parent.nodeSize - 2 && t.depth > 0; )
    t = e.doc.resolve(t.pos + 1);
  const r = gr(
    e.doc.slice(t.pos, o.pos, !0),
    n
  );
  return {
    _meta: {
      startPos: t.pos,
      endPos: o.pos
    },
    ...r
  };
}
function Li(e) {
  const { bnBlock: n } = Ge(e), t = A(e.doc), o = e.doc.resolve(n.beforePos), r = o.nodeBefore, s = e.doc.resolve(n.afterPos).nodeAfter;
  let i;
  return o.depth > 1 && (i = o.node(), i.type.isInGroup("bnBlock") || (i = o.node(o.depth - 1))), {
    block: E(n.node, t),
    prevBlock: r === null ? void 0 : E(r, t),
    nextBlock: s === null ? void 0 : E(s, t),
    parentBlock: i === void 0 ? void 0 : E(i, t)
  };
}
function Xn(e, n, t = "start") {
  const o = typeof n == "string" ? n : n.id, r = A(e.doc), s = Pe(r), i = F(o, e.doc);
  if (!i)
    throw new Error(`Block with ID ${o} not found`);
  const a = Y(i), c = s.blockSchema[a.blockNoteType].content;
  if (a.isBlockContainer) {
    const l = a.blockContent;
    if (c === "none") {
      e.setSelection(be.create(e.doc, l.beforePos));
      return;
    }
    if (c === "inline")
      t === "start" ? e.setSelection(
        H.create(e.doc, l.beforePos + 1)
      ) : e.setSelection(
        H.create(e.doc, l.afterPos - 1)
      );
    else if (c === "table")
      t === "start" ? e.setSelection(
        H.create(e.doc, l.beforePos + 4)
      ) : e.setSelection(
        H.create(e.doc, l.afterPos - 4)
      );
    else
      throw new K(c);
  } else {
    const l = t === "start" ? a.childContainer.node.firstChild : a.childContainer.node.lastChild;
    Xn(e, l.attrs.id, t);
  }
}
let fe;
async function Tt() {
  if (fe)
    return fe;
  const e = await Promise.all([
    import("rehype-parse"),
    import("rehype-stringify"),
    import("unified"),
    import("hast-util-from-dom"),
    import("rehype-remark"),
    import("remark-gfm"),
    import("remark-stringify"),
    import("remark-parse"),
    import("remark-rehype"),
    import("rehype-format")
  ]);
  return fe = {
    rehypeParse: e[0],
    rehypeStringify: e[1],
    unified: e[2],
    hastUtilFromDom: e[3],
    rehypeRemark: e[4],
    remarkGfm: e[5],
    remarkStringify: e[6],
    remarkParse: e[7],
    remarkRehype: e[8],
    rehypeFormat: e[9]
  }, fe;
}
function Ai() {
  const e = (n) => {
    let t = n.children.length;
    for (let o = 0; o < t; o++) {
      const r = n.children[o];
      if (r.type === "element" && (e(r), r.tagName === "u"))
        if (r.children.length > 0) {
          n.children.splice(o, 1, ...r.children);
          const s = r.children.length - 1;
          t += s, o += s;
        } else
          n.children.splice(o, 1), t--, o--;
    }
  };
  return e;
}
function Ni() {
  const e = fe;
  if (!e)
    throw new Error(
      "addSpacesToCheckboxes requires ESM dependencies to be initialized"
    );
  const n = (t) => {
    var o;
    if (t.children && "length" in t.children && t.children.length)
      for (let r = t.children.length - 1; r >= 0; r--) {
        const s = t.children[r], i = r + 1 < t.children.length ? t.children[r + 1] : void 0;
        s.type === "element" && s.tagName === "input" && ((o = s.properties) == null ? void 0 : o.type) === "checkbox" && (i == null ? void 0 : i.type) === "element" && i.tagName === "p" ? (i.tagName = "span", i.children.splice(
          0,
          0,
          e.hastUtilFromDom.fromDom(
            document.createTextNode(" ")
          )
        )) : n(s);
      }
  };
  return n;
}
function Pt(e) {
  const n = fe;
  if (!n)
    throw new Error(
      "cleanHTMLToMarkdown requires ESM dependencies to be initialized"
    );
  return n.unified.unified().use(n.rehypeParse.default, { fragment: !0 }).use(Ai).use(Ni).use(n.rehypeRemark.default).use(n.remarkGfm.default).use(n.remarkStringify.default, {
    handlers: { text: (o) => o.value }
  }).processSync(e).value;
}
async function Hi(e, n, t, o) {
  await Tt();
  const s = Ye(n, t).exportBlocks(e, o);
  return Pt(s);
}
function Di(e) {
  return Array.prototype.indexOf.call(e.parentElement.childNodes, e);
}
function Oi(e) {
  return e.nodeType === 3 && !/\S/.test(e.nodeValue || "");
}
function Ri(e) {
  e.querySelectorAll("li > ul, li > ol").forEach((n) => {
    const t = Di(n), o = n.parentElement, r = Array.from(o.childNodes).slice(
      t + 1
    );
    n.remove(), r.forEach((s) => {
      s.remove();
    }), o.insertAdjacentElement("afterend", n), r.reverse().forEach((s) => {
      if (Oi(s))
        return;
      const i = document.createElement("li");
      i.append(s), n.insertAdjacentElement("afterend", i);
    }), o.childNodes.length === 0 && o.remove();
  });
}
function Vi(e) {
  e.querySelectorAll("li + ul, li + ol").forEach((n) => {
    var s, i;
    const t = n.previousElementSibling, o = document.createElement("div");
    t.insertAdjacentElement("afterend", o), o.append(t);
    const r = document.createElement("div");
    for (r.setAttribute("data-node-type", "blockGroup"), o.append(r); ((s = o.nextElementSibling) == null ? void 0 : s.nodeName) === "UL" || ((i = o.nextElementSibling) == null ? void 0 : i.nodeName) === "OL"; )
      r.append(o.nextElementSibling);
  });
}
let Jt = null;
function _i() {
  return Jt || (Jt = document.implementation.createHTMLDocument("title"));
}
function Zn(e) {
  if (typeof e == "string") {
    const n = _i().createElement("div");
    n.innerHTML = e, e = n;
  }
  return Ri(e), Vi(e), e;
}
async function Qn(e, n) {
  const t = Zn(e), r = Be.fromSchema(n).parse(t, {
    topNode: n.nodes.blockGroup.create()
  }), s = [];
  for (let i = 0; i < r.childCount; i++)
    s.push(E(r.child(i), n));
  return s;
}
function Ui(e, n) {
  const t = n.value ? n.value : "", o = {};
  n.lang && (o["data-language"] = n.lang);
  let r = {
    type: "element",
    tagName: "code",
    properties: o,
    children: [{ type: "text", value: t }]
  };
  return n.meta && (r.data = { meta: n.meta }), e.patch(n, r), r = e.applyData(n, r), r = {
    type: "element",
    tagName: "pre",
    properties: {},
    children: [r]
  }, e.patch(n, r), r;
}
async function eo(e) {
  const n = await Tt();
  return n.unified.unified().use(n.remarkParse.default).use(n.remarkGfm.default).use(n.remarkRehype.default, {
    handlers: {
      ...n.remarkRehype.defaultHandlers,
      code: Ui
    }
  }).use(n.rehypeStringify.default).processSync(e).value;
}
async function $i(e, n) {
  const t = await eo(e);
  return Qn(t, n);
}
const It = [
  "vscode-editor-data",
  "blocknote/html",
  "text/markdown",
  "text/html",
  "text/plain",
  "Files"
];
function Fi(e, n) {
  if (!e.startsWith(".") || !n.startsWith("."))
    throw new Error("The strings provided are not valid file extensions.");
  return e === n;
}
function zi(e, n) {
  const t = e.split("/"), o = n.split("/");
  if (t.length !== 2)
    throw new Error(`The string ${e} is not a valid MIME type.`);
  if (o.length !== 2)
    throw new Error(`The string ${n} is not a valid MIME type.`);
  return t[1] === "*" || o[1] === "*" ? t[0] === o[0] : (t[0] === "*" || o[0] === "*" || t[0] === o[0]) && t[1] === o[1];
}
function Xt(e, n, t, o = "after") {
  let r;
  return Array.isArray(n.content) && n.content.length === 0 ? r = e.updateBlock(n, t).id : r = e.insertBlocks(
    [t],
    n,
    o
  )[0].id, r;
}
async function to(e, n) {
  var i;
  if (!n.uploadFile) {
    console.warn(
      "Attempted ot insert file, but uploadFile is not set in the BlockNote editor options"
    );
    return;
  }
  const t = "dataTransfer" in e ? e.dataTransfer : e.clipboardData;
  if (t === null)
    return;
  let o = null;
  for (const a of It)
    if (t.types.includes(a)) {
      o = a;
      break;
    }
  if (o !== "Files")
    return;
  const r = t.items;
  if (!r)
    return;
  e.preventDefault();
  const s = Object.values(n.schema.blockSchema).filter(
    (a) => a.isFileBlock
  );
  for (let a = 0; a < r.length; a++) {
    let c = "file";
    for (const d of s)
      for (const u of d.fileBlockAccept || []) {
        const h = u.startsWith("."), f = r[a].getAsFile();
        if (f && (!h && f.type && zi(r[a].type, u) || h && Fi(
          "." + f.name.split(".").pop(),
          u
        ))) {
          c = d.type;
          break;
        }
      }
    const l = r[a].getAsFile();
    if (l) {
      const d = {
        type: c,
        props: {
          name: l.name
        }
      };
      let u;
      if (e.type === "paste") {
        const m = n.getTextCursorPosition().block;
        u = Xt(n, m, d);
      } else if (e.type === "drop") {
        const m = {
          left: e.clientX,
          top: e.clientY
        }, g = (i = n.prosemirrorView) == null ? void 0 : i.posAtCoords(m);
        if (!g)
          return;
        u = n.transact((b) => {
          var v;
          const k = ee(b.doc, g.pos), w = (v = n.prosemirrorView) == null ? void 0 : v.dom.querySelector(
            `[data-id="${k.node.attrs.id}"]`
          ), y = w == null ? void 0 : w.getBoundingClientRect();
          return Xt(
            n,
            n.getBlock(k.node.attrs.id),
            d,
            y && (y.top + y.bottom) / 2 > m.top ? "before" : "after"
          );
        });
      } else
        return;
      const h = await n.uploadFile(l, u), f = typeof h == "string" ? {
        props: {
          url: h
        }
      } : { ...h };
      n.updateBlock(u, f);
    }
  }
}
const Wi = (e) => U.create({
  name: "dropFile",
  addProseMirrorPlugins() {
    return [
      new I({
        props: {
          handleDOMEvents: {
            drop(n, t) {
              if (!e.isEditable)
                return;
              let o = null;
              for (const r of It)
                if (t.dataTransfer.types.includes(r)) {
                  o = r;
                  break;
                }
              return o === null ? !0 : o === "Files" ? (to(t, e), !0) : !1;
            }
          }
        }
      })
    ];
  }
}), ji = /(^|\n) {0,3}#{1,6} {1,8}[^\n]{1,64}\r?\n\r?\n\s{0,32}\S/, Gi = /(_|__|\*|\*\*|~~|==|\+\+)(?!\s)(?:[^\s](?:.{0,62}[^\s])?|\S)(?=\1)/, qi = /\[[^\]]{1,128}\]\(https?:\/\/\S{1,999}\)/, Ki = /(?:\s|^)`(?!\s)(?:[^\s`](?:[^`]{0,46}[^\s`])?|[^\s`])`([^\w]|$)/, Yi = /(?:^|\n)\s{0,5}-\s{1}[^\n]+\n\s{0,15}-\s/, Ji = /(?:^|\n)\s{0,5}\d+\.\s{1}[^\n]+\n\s{0,15}\d+\.\s/, Xi = /\n{2} {0,3}-{2,48}\n{2}/, Zi = /(?:\n|^)(```|~~~|\$\$)(?!`|~)[^\s]{0,64} {0,64}[^\n]{0,64}\n[\s\S]{0,9999}?\s*\1 {0,64}(?:\n+|$)/, Qi = /(?:\n|^)(?!\s)\w[^\n]{0,64}\r?\n(-|=)\1{0,64}\n\n\s{0,64}(\w|$)/, ea = /(?:^|(\r?\n\r?\n))( {0,3}>[^\n]{1,333}\n){1,999}($|(\r?\n))/, ta = /^\s*\|(.+\|)+\s*$/m, na = /^\s*\|(\s*[-:]+[-:]\s*\|)+\s*$/m, oa = /^\s*\|(.+\|)+\s*$/m, ra = (e) => ji.test(e) || Gi.test(e) || qi.test(e) || Ki.test(e) || Yi.test(e) || Ji.test(e) || Xi.test(e) || Zi.test(e) || Qi.test(e) || ea.test(e) || ta.test(e) || na.test(e) || oa.test(e);
async function sa(e, n) {
  const { schema: t } = n.state;
  if (!e.clipboardData)
    return !1;
  const o = e.clipboardData.getData("text/plain");
  if (!o)
    return !1;
  if (!t.nodes.codeBlock)
    return n.pasteText(o), !0;
  const r = e.clipboardData.getData("vscode-editor-data"), s = r ? JSON.parse(r) : void 0, i = s == null ? void 0 : s.mode;
  return i ? (n.pasteHTML(
    `<pre><code class="language-${i}">${o.replace(
      /\r\n?/g,
      `
`
    )}</code></pre>`
  ), !0) : !1;
}
function ia({
  event: e,
  editor: n,
  prioritizeMarkdownOverHTML: t,
  plainTextAsMarkdown: o
}) {
  var a;
  if (n.transact(
    (c) => c.selection.$from.parent.type.spec.code && c.selection.$to.parent.type.spec.code
  )) {
    const c = (a = e.clipboardData) == null ? void 0 : a.getData("text/plain");
    if (c)
      return n.pasteText(c), !0;
  }
  let s;
  for (const c of It)
    if (e.clipboardData.types.includes(c)) {
      s = c;
      break;
    }
  if (!s)
    return !0;
  if (s === "vscode-editor-data")
    return sa(e, n.prosemirrorView), !0;
  if (s === "Files")
    return to(e, n), !0;
  const i = e.clipboardData.getData(s);
  if (s === "blocknote/html")
    return n.pasteHTML(i, !0), !0;
  if (s === "text/markdown")
    return n.pasteMarkdown(i), !0;
  if (t) {
    const c = e.clipboardData.getData("text/plain");
    if (ra(c))
      return n.pasteMarkdown(c), !0;
  }
  return s === "text/html" ? (n.pasteHTML(i), !0) : o ? (n.pasteMarkdown(i), !0) : (n.pasteText(i), !0);
}
const aa = (e, n) => U.create({
  name: "pasteFromClipboard",
  addProseMirrorPlugins() {
    return [
      new I({
        props: {
          handleDOMEvents: {
            paste(t, o) {
              if (o.preventDefault(), !!e.isEditable)
                return n({
                  event: o,
                  editor: e,
                  defaultPasteHandler: ({
                    prioritizeMarkdownOverHTML: r = !0,
                    plainTextAsMarkdown: s = !0
                  } = {}) => ia({
                    event: o,
                    editor: e,
                    prioritizeMarkdownOverHTML: r,
                    plainTextAsMarkdown: s
                  })
                });
            }
          }
        }
      })
    ];
  }
});
function no(e) {
  const n = [];
  return e.descendants((t) => {
    var r, s;
    const o = A(t);
    return t.type.name === "blockContainer" && ((r = t.firstChild) == null ? void 0 : r.type.name) === "blockGroup" ? !0 : t.type.name === "columnList" && t.childCount === 1 ? ((s = t.firstChild) == null || s.forEach((i) => {
      n.push(E(i, o));
    }), !1) : t.type.isInGroup("bnBlock") ? (n.push(E(t, o)), !1) : !0;
  }), n;
}
function ca(e, n, t) {
  var a;
  let o = !1;
  const r = e.state.selection instanceof xe;
  if (!r) {
    const c = e.state.doc.slice(
      e.state.selection.from,
      e.state.selection.to,
      !1
    ).content, l = [];
    for (let d = 0; d < c.childCount; d++)
      l.push(c.child(d));
    o = l.find(
      (d) => d.type.isInGroup("bnBlock") || d.type.name === "blockGroup" || d.type.spec.group === "blockContent"
    ) === void 0, o && (n = c);
  }
  let s;
  const i = Ye(
    e.state.schema,
    t
  );
  if (r) {
    ((a = n.firstChild) == null ? void 0 : a.type.name) === "table" && (n = n.firstChild.content);
    const c = wn(
      n,
      t.schema.inlineContentSchema,
      t.schema.styleSchema
    );
    s = `<table>${i.exportInlineContent(
      c,
      {}
    )}</table>`;
  } else if (o) {
    const c = qe(
      n,
      t.schema.inlineContentSchema,
      t.schema.styleSchema
    );
    s = i.exportInlineContent(c, {});
  } else {
    const c = no(n);
    s = i.exportBlocks(c, {});
  }
  return s;
}
function oo(e, n) {
  "node" in e.state.selection && e.state.selection.node.type.spec.group === "blockContent" && n.transact(
    (i) => i.setSelection(
      new be(i.doc.resolve(e.state.selection.from - 1))
    )
  );
  const t = e.serializeForClipboard(
    e.state.selection.content()
  ).dom.innerHTML, o = e.state.selection.content().content, r = ca(
    e,
    o,
    n
  ), s = Pt(r);
  return { clipboardHTML: t, externalHTML: r, markdown: s };
}
const Zt = () => {
  const e = window.getSelection();
  if (!e || e.isCollapsed)
    return !0;
  let n = e.focusNode;
  for (; n; ) {
    if (n instanceof HTMLElement && n.getAttribute("contenteditable") === "false")
      return !0;
    n = n.parentElement;
  }
  return !1;
}, Qt = (e, n, t) => {
  t.preventDefault(), t.clipboardData.clearData();
  const { clipboardHTML: o, externalHTML: r, markdown: s } = oo(
    n,
    e
  );
  t.clipboardData.setData("blocknote/html", o), t.clipboardData.setData("text/html", r), t.clipboardData.setData("text/plain", s);
}, la = (e) => U.create({
  name: "copyToClipboard",
  addProseMirrorPlugins() {
    return [
      new I({
        props: {
          handleDOMEvents: {
            copy(n, t) {
              return Zt() || Qt(e, n, t), !0;
            },
            cut(n, t) {
              return Zt() || (Qt(e, n, t), n.editable && n.dispatch(n.state.tr.deleteSelection())), !0;
            },
            // This is for the use-case in which only a block without content
            // is selected, e.g. an image block, and dragged (not using the
            // drag handle).
            dragstart(n, t) {
              if (!("node" in n.state.selection) || n.state.selection.node.type.spec.group !== "blockContent")
                return;
              e.transact(
                (i) => i.setSelection(
                  new be(
                    i.doc.resolve(n.state.selection.from - 1)
                  )
                )
              ), t.preventDefault(), t.dataTransfer.clearData();
              const { clipboardHTML: o, externalHTML: r, markdown: s } = oo(n, e);
              return t.dataTransfer.setData("blocknote/html", o), t.dataTransfer.setData("text/html", r), t.dataTransfer.setData("text/plain", s), !0;
            }
          }
        }
      })
    ];
  }
}), da = U.create({
  name: "blockBackgroundColor",
  addGlobalAttributes() {
    return [
      {
        types: ["blockContainer", "tableCell", "tableHeader"],
        attributes: {
          backgroundColor: {
            default: M.backgroundColor.default,
            parseHTML: (e) => e.hasAttribute("data-background-color") ? e.getAttribute("data-background-color") : M.backgroundColor.default,
            renderHTML: (e) => e.backgroundColor === M.backgroundColor.default ? {} : {
              "data-background-color": e.backgroundColor
            }
          }
        }
      }
    ];
  }
});
class Lt {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    p(this, "callbacks", {});
  }
  on(n, t) {
    return this.callbacks[n] || (this.callbacks[n] = []), this.callbacks[n].push(t), () => this.off(n, t);
  }
  emit(n, ...t) {
    const o = this.callbacks[n];
    o && o.forEach((r) => r.apply(this, t));
  }
  off(n, t) {
    const o = this.callbacks[n];
    o && (t ? this.callbacks[n] = o.filter((r) => r !== t) : delete this.callbacks[n]);
  }
  removeAllListeners() {
    this.callbacks = {};
  }
}
class L extends Lt {
  // eslint-disable-next-line
  constructor(...t) {
    super();
    p(this, "plugins", []);
  }
  static key() {
    throw new Error("You must implement the key method in your extension");
  }
  addProsemirrorPlugin(t) {
    this.plugins.push(t);
  }
  get priority() {
  }
}
class ua extends L {
  constructor() {
    super();
    p(this, "beforeChangeCallbacks", []);
    this.addProsemirrorPlugin(
      new I({
        filterTransaction: (t) => {
          let o;
          return this.beforeChangeCallbacks.reduce((r, s) => r === !1 ? r : s({
            getChanges() {
              return o || (o = Mn(t), o);
            },
            tr: t
          }) !== !1, !0);
        }
      })
    );
  }
  static key() {
    return "blockChange";
  }
  subscribe(t) {
    return this.beforeChangeCallbacks.push(t), () => {
      this.beforeChangeCallbacks = this.beforeChangeCallbacks.filter(
        (o) => o !== t
      );
    };
  }
}
const me = class me extends L {
  constructor(t) {
    super();
    p(this, "provider");
    p(this, "recentlyUpdatedCursors");
    p(this, "renderCursor", (t, o) => {
      let r = this.recentlyUpdatedCursors.get(o);
      if (!r) {
        const s = (this.collaboration.renderCursor ?? me.defaultCursorRender)(t);
        this.collaboration.showCursorLabels !== "always" && (s.addEventListener("mouseenter", () => {
          const i = this.recentlyUpdatedCursors.get(o);
          i.element.setAttribute("data-active", ""), i.hideTimeout && (clearTimeout(i.hideTimeout), this.recentlyUpdatedCursors.set(o, {
            element: i.element,
            hideTimeout: void 0
          }));
        }), s.addEventListener("mouseleave", () => {
          const i = this.recentlyUpdatedCursors.get(o);
          this.recentlyUpdatedCursors.set(o, {
            element: i.element,
            hideTimeout: setTimeout(() => {
              i.element.removeAttribute("data-active");
            }, 2e3)
          });
        })), r = {
          element: s,
          hideTimeout: void 0
        }, this.recentlyUpdatedCursors.set(o, r);
      }
      return r.element;
    });
    p(this, "updateUser", (t) => {
      this.provider.awareness.setLocalStateField("user", t);
    });
    this.collaboration = t, this.provider = t.provider, this.recentlyUpdatedCursors = /* @__PURE__ */ new Map(), this.provider.awareness.setLocalStateField("user", t.user), t.showCursorLabels !== "always" && this.provider.awareness.on(
      "change",
      ({
        updated: o
      }) => {
        for (const r of o) {
          const s = this.recentlyUpdatedCursors.get(r);
          s && (s.element.setAttribute("data-active", ""), s.hideTimeout && clearTimeout(s.hideTimeout), this.recentlyUpdatedCursors.set(r, {
            element: s.element,
            hideTimeout: setTimeout(() => {
              s.element.removeAttribute("data-active");
            }, 2e3)
          }));
        }
      }
    ), this.addProsemirrorPlugin(
      Ko(this.provider.awareness, {
        selectionBuilder: Yo,
        cursorBuilder: this.renderCursor
      })
    );
  }
  static key() {
    return "yCursorPlugin";
  }
  get priority() {
    return 999;
  }
  /**
   * Determine whether the foreground color should be white or black based on a provided background color
   * Inspired by: https://stackoverflow.com/a/3943023
   *
   */
  static isDarkColor(t) {
    const o = t.charAt(0) === "#" ? t.substring(1, 7) : t, r = parseInt(o.substring(0, 2), 16), s = parseInt(o.substring(2, 4), 16), i = parseInt(o.substring(4, 6), 16), c = [r / 255, s / 255, i / 255].map((d) => d <= 0.03928 ? d / 12.92 : Math.pow((d + 0.055) / 1.055, 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] <= 0.179;
  }
};
p(me, "defaultCursorRender", (t) => {
  const o = document.createElement("span");
  o.classList.add("bn-collaboration-cursor__base");
  const r = document.createElement("span");
  r.setAttribute("contentedEditable", "false"), r.classList.add("bn-collaboration-cursor__caret"), r.setAttribute(
    "style",
    `background-color: ${t.color}; color: ${me.isDarkColor(t.color) ? "white" : "black"}`
  );
  const s = document.createElement("span");
  return s.classList.add("bn-collaboration-cursor__label"), s.setAttribute(
    "style",
    `background-color: ${t.color}; color: ${me.isDarkColor(t.color) ? "white" : "black"}`
  ), s.insertBefore(document.createTextNode(t.name), null), r.insertBefore(s, null), o.insertBefore(document.createTextNode("⁠"), null), o.insertBefore(r, null), o.insertBefore(document.createTextNode("⁠"), null), o;
});
let Fe = me;
class ft extends L {
  static key() {
    return "ySyncPlugin";
  }
  constructor(n) {
    super(), this.addProsemirrorPlugin(Jo(n));
  }
  get priority() {
    return 1001;
  }
}
class mt extends L {
  static key() {
    return "yUndoPlugin";
  }
  constructor({ editor: n }) {
    super(), this.addProsemirrorPlugin(Xo({ trackedOrigins: [n] }));
  }
  get priority() {
    return 1e3;
  }
}
const ro = re.create({
  name: "comment",
  excludes: "",
  inclusive: !1,
  keepOnSplit: !0,
  addAttributes() {
    return {
      // orphans are marks that currently don't have an active thread. It could be
      // that users have resolved the thread. Resolved threads by default are not shown in the document,
      // but we need to keep the mark (positioning) data so we can still "revive" it when the thread is unresolved
      // or we enter a "comments" view that includes resolved threads.
      orphan: {
        parseHTML: (e) => !!e.getAttribute("data-orphan"),
        renderHTML: (e) => e.orphan ? {
          "data-orphan": "true"
        } : {},
        default: !1
      },
      threadId: {
        parseHTML: (e) => e.getAttribute("data-bn-thread-id"),
        renderHTML: (e) => ({
          "data-bn-thread-id": e.threadId
        }),
        default: ""
      }
    };
  },
  renderHTML({ HTMLAttributes: e }) {
    return [
      "span",
      bt(e, {
        class: "bn-thread-mark"
      })
    ];
  },
  parseHTML() {
    return [{ tag: "span.bn-thread-mark" }];
  },
  extendMarkSchema(e) {
    return e.name === "comment" ? {
      blocknoteIgnore: !0
    } : {};
  }
});
class pa extends Lt {
  constructor(t) {
    super();
    p(this, "userCache", /* @__PURE__ */ new Map());
    // avoid duplicate loads
    p(this, "loadingUsers", /* @__PURE__ */ new Set());
    this.resolveUsers = t;
  }
  /**
   * Load information about users based on an array of user ids.
   */
  async loadUsers(t) {
    const o = t.filter(
      (r) => !this.userCache.has(r) && !this.loadingUsers.has(r)
    );
    if (o.length !== 0) {
      for (const r of o)
        this.loadingUsers.add(r);
      try {
        const r = await this.resolveUsers(o);
        for (const s of r)
          this.userCache.set(s.id, s);
        this.emit("update", this.userCache);
      } finally {
        for (const r of o)
          this.loadingUsers.delete(r);
      }
    }
  }
  /**
   * Retrieve information about a user based on their id, if cached.
   *
   * The user will have to be loaded via `loadUsers` first
   */
  getUser(t) {
    return this.userCache.get(t);
  }
  /**
   * Subscribe to changes in the user store.
   *
   * @param cb - The callback to call when the user store changes.
   * @returns A function to unsubscribe from the user store.
   */
  subscribe(t) {
    return this.on("update", t);
  }
}
const He = new V("blocknote-comments"), ha = "SET_SELECTED_THREAD_ID";
function fa(e, n) {
  const t = /* @__PURE__ */ new Map();
  return e.descendants((o, r) => {
    o.marks.forEach((s) => {
      if (s.type.name === n) {
        const i = s.attrs.threadId;
        if (!i)
          return;
        const a = r, c = a + o.nodeSize, l = t.get(i) ?? {
          from: 1 / 0,
          to: 0
        };
        t.set(i, {
          from: Math.min(a, l.from),
          to: Math.max(c, l.to)
        });
      }
    });
  }), t;
}
class ma extends L {
  constructor(t, o, r) {
    super();
    p(this, "userStore");
    /**
     * Whether a comment is currently being composed
     */
    p(this, "pendingComment", !1);
    /**
     * The currently selected thread id
     */
    p(this, "selectedThreadId");
    /**
     * Store the positions of all threads in the document.
     * this can be used later to implement a floating sidebar
     */
    p(this, "threadPositions", /* @__PURE__ */ new Map());
    /**
     * when a thread is resolved or deleted, we need to update the marks to reflect the new state
     */
    p(this, "updateMarksFromThreads", (t) => {
      this.editor.transact((o) => {
        o.doc.descendants((r, s) => {
          r.marks.forEach((i) => {
            if (i.type.name === this.markType) {
              const a = i.type, c = i.attrs.threadId, l = t.get(c), d = !!(!l || l.resolved || l.deletedAt);
              if (d !== i.attrs.orphan) {
                const u = Math.max(s, 0), h = Math.min(
                  s + r.nodeSize,
                  o.doc.content.size - 1,
                  o.doc.content.size - 1
                );
                o.removeMark(u, h, i), o.addMark(
                  u,
                  h,
                  a.create({
                    ...i.attrs,
                    orphan: d
                  })
                ), d && this.selectedThreadId === c && (this.selectedThreadId = void 0, this.emitStateUpdate());
              }
            }
          });
        });
      });
    });
    if (this.editor = t, this.threadStore = o, this.markType = r, !t.resolveUsers)
      throw new Error("resolveUsers is required for comments");
    this.userStore = new pa(t.resolveUsers), this.threadStore.subscribe(this.updateMarksFromThreads), t.onCreate(() => {
      this.updateMarksFromThreads(this.threadStore.getThreads()), t.onSelectionChange(() => {
        this.pendingComment && (this.pendingComment = !1, this.emitStateUpdate());
      });
    });
    const s = this;
    this.addProsemirrorPlugin(
      new I({
        key: He,
        state: {
          init() {
            return {
              decorations: q.empty
            };
          },
          apply(i, a) {
            const c = i.getMeta(He);
            if (!i.docChanged && !c)
              return a;
            const l = i.docChanged ? fa(i.doc, s.markType) : s.threadPositions;
            (l.size > 0 || s.threadPositions.size > 0) && (s.threadPositions = l, s.emitStateUpdate());
            const d = [];
            if (s.selectedThreadId) {
              const u = l.get(
                s.selectedThreadId
              );
              u && d.push(
                Q.inline(
                  u.from,
                  u.to,
                  {
                    class: "bn-thread-mark-selected"
                  }
                )
              );
            }
            return {
              decorations: q.create(i.doc, d)
            };
          }
        },
        props: {
          decorations(i) {
            var a;
            return ((a = He.getState(i)) == null ? void 0 : a.decorations) ?? q.empty;
          },
          /**
           * Handle click on a thread mark and mark it as selected
           */
          handleClick: (i, a, c) => {
            if (c.button !== 0)
              return;
            const l = i.state.doc.nodeAt(a);
            if (!l) {
              s.selectThread(void 0);
              return;
            }
            const d = l.marks.find(
              (h) => h.type.name === r && h.attrs.orphan !== !0
            ), u = d == null ? void 0 : d.attrs.threadId;
            s.selectThread(u, !1);
          }
        }
      })
    );
  }
  static key() {
    return "comments";
  }
  emitStateUpdate() {
    this.emit("update", {
      selectedThreadId: this.selectedThreadId,
      pendingComment: this.pendingComment,
      threadPositions: this.threadPositions
    });
  }
  /**
   * Subscribe to state updates
   */
  onUpdate(t) {
    return this.on("update", t);
  }
  /**
   * Set the selected thread
   */
  selectThread(t, o = !0) {
    var r, s;
    if (this.selectedThreadId !== t && (this.selectedThreadId = t, this.emitStateUpdate(), this.editor.transact(
      (i) => i.setMeta(He, {
        name: ha
      })
    ), t && o)) {
      const i = this.threadPositions.get(t);
      if (!i)
        return;
      (s = (r = this.editor.prosemirrorView) == null ? void 0 : r.domAtPos(i.from).node) == null || s.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }
  /**
   * Start a pending comment (e.g.: when clicking the "Add comment" button)
   */
  startPendingComment() {
    this.pendingComment = !0, this.emitStateUpdate();
  }
  /**
   * Stop a pending comment (e.g.: user closes the comment composer)
   */
  stopPendingComment() {
    this.pendingComment = !1, this.emitStateUpdate();
  }
  /**
   * Create a thread at the current selection
   */
  async createThread(t) {
    const o = await this.threadStore.createThread(t);
    if (this.threadStore.addThreadToDocument) {
      const r = this.editor.prosemirrorView, s = r.state.selection, i = de.getState(r.state), a = {
        prosemirror: {
          head: s.head,
          anchor: s.anchor
        },
        yjs: i ? Zo(i.binding, r.state) : void 0
        // if we're not using yjs
      };
      await this.threadStore.addThreadToDocument({
        threadId: o.id,
        selection: a
      });
    } else
      this.editor._tiptapEditor.commands.setMark(this.markType, {
        orphan: !1,
        threadId: o.id
      });
  }
}
class ga {
  constructor(n, t, o, r) {
    p(this, "state");
    p(this, "emitUpdate");
    p(this, "mouseDownHandler", () => {
      var n;
      (n = this.state) != null && n.show && (this.state.show = !1, this.emitUpdate());
    });
    // For dragging the whole editor.
    p(this, "dragstartHandler", () => {
      var n;
      (n = this.state) != null && n.show && (this.state.show = !1, this.emitUpdate());
    });
    p(this, "scrollHandler", () => {
      var n;
      if ((n = this.state) != null && n.show) {
        const t = this.pmView.root.querySelector(
          `[data-node-type="blockContainer"][data-id="${this.state.block.id}"]`
        );
        if (!t)
          return;
        this.state.referencePos = t.getBoundingClientRect(), this.emitUpdate();
      }
    });
    p(this, "closeMenu", () => {
      var n;
      (n = this.state) != null && n.show && (this.state.show = !1, this.emitUpdate());
    });
    this.editor = n, this.pluginKey = t, this.pmView = o, this.emitUpdate = () => {
      if (!this.state)
        throw new Error("Attempting to update uninitialized file panel");
      r(this.state);
    }, o.dom.addEventListener("mousedown", this.mouseDownHandler), o.dom.addEventListener("dragstart", this.dragstartHandler), o.root.addEventListener("scroll", this.scrollHandler, !0);
  }
  update(n, t) {
    var a, c;
    const o = this.pluginKey.getState(n.state), r = this.pluginKey.getState(t);
    if (!((a = this.state) != null && a.show) && (o != null && o.block) && this.editor.isEditable) {
      const l = this.pmView.root.querySelector(
        `[data-node-type="blockContainer"][data-id="${o.block.id}"]`
      );
      if (!l)
        return;
      this.state = {
        show: !0,
        referencePos: l.getBoundingClientRect(),
        block: o.block
      }, this.emitUpdate();
      return;
    }
    const s = (o == null ? void 0 : o.block) && !(r != null && r.block), i = !(o != null && o.block) && (r == null ? void 0 : r.block);
    s && this.state && !this.state.show && (this.state.show = !0, this.emitUpdate()), i && ((c = this.state) != null && c.show) && (this.state.show = !1, this.emitUpdate());
  }
  destroy() {
    this.pmView.dom.removeEventListener("mousedown", this.mouseDownHandler), this.pmView.dom.removeEventListener("dragstart", this.dragstartHandler), this.pmView.root.removeEventListener("scroll", this.scrollHandler, !0);
  }
}
const ot = new V(
  "FilePanelPlugin"
);
class ba extends L {
  constructor(t) {
    super();
    p(this, "view");
    p(this, "closeMenu", () => {
      var t;
      return (t = this.view) == null ? void 0 : t.closeMenu();
    });
    this.addProsemirrorPlugin(
      new I({
        key: ot,
        view: (o) => (this.view = new ga(
          t,
          ot,
          o,
          (r) => {
            this.emit("update", r);
          }
        ), this.view),
        props: {
          handleKeyDown: (o, r) => {
            var s;
            return r.key === "Escape" && this.shown ? ((s = this.view) == null || s.closeMenu(), !0) : !1;
          }
        },
        state: {
          init: () => ({
            block: void 0
          }),
          apply: (o, r) => {
            const s = o.getMeta(ot);
            return s || (!o.getMeta(de) && (o.selectionSet || o.docChanged) ? { block: void 0 } : r);
          }
        }
      })
    );
  }
  static key() {
    return "filePanel";
  }
  get shown() {
    var t, o;
    return ((o = (t = this.view) == null ? void 0 : t.state) == null ? void 0 : o.show) || !1;
  }
  onUpdate(t) {
    return this.on("update", t);
  }
}
class ka {
  constructor(n, t, o) {
    p(this, "state");
    p(this, "emitUpdate");
    p(this, "preventHide", !1);
    p(this, "preventShow", !1);
    p(this, "shouldShow", ({ view: n, state: t, from: o, to: r }) => {
      const { doc: s, selection: i } = t, { empty: a } = i, c = !s.textBetween(o, r).length && pn(t.selection);
      if (i.$from.parent.type.spec.code || st(i) && i.node.type.spec.code || a || c)
        return !1;
      const l = document.activeElement;
      return !(!this.isElementWithinEditorWrapper(l) && n.editable);
    });
    p(this, "blurHandler", (n) => {
      var o;
      if (this.preventHide) {
        this.preventHide = !1;
        return;
      }
      const t = this.pmView.dom.parentElement;
      // An element is clicked.
      n && n.relatedTarget && // Element is inside the editor.
      (t === n.relatedTarget || t.contains(n.relatedTarget) || n.relatedTarget.matches(
        ".bn-ui-container, .bn-ui-container *"
      )) || (o = this.state) != null && o.show && (this.state.show = !1, this.emitUpdate());
    });
    p(this, "isElementWithinEditorWrapper", (n) => {
      if (!n)
        return !1;
      const t = this.pmView.dom.parentElement;
      return t ? t.contains(n) : !1;
    });
    p(this, "viewMousedownHandler", (n) => {
      (!this.isElementWithinEditorWrapper(n.target) || n.button === 0) && (this.preventShow = !0);
    });
    p(this, "mouseupHandler", () => {
      this.preventShow && (this.preventShow = !1, setTimeout(() => this.update(this.pmView)));
    });
    // For dragging the whole editor.
    p(this, "dragHandler", () => {
      var n;
      (n = this.state) != null && n.show && (this.state.show = !1, this.emitUpdate());
    });
    p(this, "scrollHandler", () => {
      var n;
      (n = this.state) != null && n.show && (this.state.referencePos = this.getSelectionBoundingBox(), this.emitUpdate());
    });
    p(this, "closeMenu", () => {
      var n;
      (n = this.state) != null && n.show && (this.state.show = !1, this.emitUpdate());
    });
    this.editor = n, this.pmView = t, this.emitUpdate = () => {
      if (!this.state)
        throw new Error(
          "Attempting to update uninitialized formatting toolbar"
        );
      o(this.state);
    }, t.dom.addEventListener("mousedown", this.viewMousedownHandler), t.root.addEventListener("mouseup", this.mouseupHandler), t.dom.addEventListener("dragstart", this.dragHandler), t.dom.addEventListener("dragover", this.dragHandler), t.dom.addEventListener("blur", this.blurHandler), t.root.addEventListener("scroll", this.scrollHandler, !0);
  }
  update(n, t) {
    var f, m, g;
    const { state: o, composing: r } = n, { doc: s, selection: i } = o, a = t && t.doc.eq(s) && t.selection.eq(i);
    if (r || a)
      return;
    const { ranges: c } = i, l = Math.min(...c.map((b) => b.$from.pos)), d = Math.max(...c.map((b) => b.$to.pos)), u = this.shouldShow({
      view: n,
      state: o,
      from: l,
      to: d
    }), h = typeof Range.prototype.getClientRects > "u";
    if (!this.preventShow && (u || this.preventHide) && !h) {
      const b = this.getSelectionBoundingBox();
      if (b.x === 0 || b.y === 0 || b.width === 0 || b.height === 0) {
        queueMicrotask(() => {
          const w = {
            show: !0,
            referencePos: this.getSelectionBoundingBox()
          };
          this.state = w, this.emitUpdate(), n.dispatch(
            n.state.tr.setSelection(
              H.create(
                n.state.doc,
                n.state.selection.from + 1,
                n.state.selection.to
              )
            )
          ), n.dispatch(
            n.state.tr.setSelection(
              H.create(
                n.state.doc,
                n.state.selection.from - 1,
                n.state.selection.to
              )
            )
          );
        });
        return;
      }
      const k = {
        show: !0,
        referencePos: this.getSelectionBoundingBox()
      };
      (k.show !== ((f = this.state) == null ? void 0 : f.show) || k.referencePos.toJSON() !== ((m = this.state) == null ? void 0 : m.referencePos.toJSON())) && (this.state = k, this.emitUpdate());
      return;
    }
    if ((g = this.state) != null && g.show && !this.preventHide && (!u || this.preventShow || !this.editor.isEditable)) {
      this.state.show = !1, this.emitUpdate();
      return;
    }
  }
  destroy() {
    this.pmView.dom.removeEventListener("mousedown", this.viewMousedownHandler), this.pmView.root.removeEventListener("mouseup", this.mouseupHandler), this.pmView.dom.removeEventListener("dragstart", this.dragHandler), this.pmView.dom.removeEventListener("dragover", this.dragHandler), this.pmView.dom.removeEventListener("blur", this.blurHandler), this.pmView.root.removeEventListener("scroll", this.scrollHandler, !0);
  }
  getSelectionBoundingBox() {
    const { state: n } = this.pmView, { selection: t } = n, { ranges: o } = t, r = Math.min(...o.map((i) => i.$from.pos)), s = Math.max(...o.map((i) => i.$to.pos));
    if (st(t)) {
      const i = this.pmView.nodeDOM(r);
      if (i)
        return i.getBoundingClientRect();
    }
    return Ue(this.pmView, r, s);
  }
}
const wa = new V(
  "FormattingToolbarPlugin"
);
class ya extends L {
  constructor(t) {
    super();
    p(this, "view");
    p(this, "closeMenu", () => this.view.closeMenu());
    this.addProsemirrorPlugin(
      new I({
        key: wa,
        view: (o) => (this.view = new ka(t, o, (r) => {
          this.emit("update", r);
        }), this.view),
        props: {
          handleKeyDown: (o, r) => r.key === "Escape" && this.shown ? (this.view.closeMenu(), !0) : !1
        }
      })
    );
  }
  static key() {
    return "formattingToolbar";
  }
  get shown() {
    var t, o;
    return ((o = (t = this.view) == null ? void 0 : t.state) == null ? void 0 : o.show) || !1;
  }
  onUpdate(t) {
    return this.on("update", t);
  }
}
const Ca = oe.create({
  name: "hardBreak",
  inline: !0,
  group: "inline",
  selectable: !1,
  linebreakReplacement: !0,
  priority: 10,
  parseHTML() {
    return [{ tag: "br" }];
  },
  renderHTML({ HTMLAttributes: e }) {
    return ["br", bt(this.options.HTMLAttributes, e)];
  },
  renderText() {
    return `
`;
  }
}), en = (e, n) => {
  const t = e.resolve(n);
  if (t.depth <= 1)
    return;
  const o = t.posAtIndex(
    t.index(t.depth - 1),
    t.depth - 1
  );
  return Te(
    e.resolve(o)
  );
}, _e = (e, n) => {
  const t = e.resolve(n), o = t.index();
  if (o === 0)
    return;
  const r = t.posAtIndex(o - 1);
  return Te(
    e.resolve(r)
  );
}, so = (e, n) => {
  for (; n.childContainer; ) {
    const t = n.childContainer.node, o = e.resolve(n.childContainer.beforePos + 1).posAtIndex(t.childCount - 1);
    n = Te(e.resolve(o));
  }
  return n;
}, va = (e, n) => e.isBlockContainer && e.blockContent.node.type.spec.content === "inline*" && e.blockContent.node.childCount > 0 && n.isBlockContainer && n.blockContent.node.type.spec.content === "inline*", Sa = (e, n, t, o) => {
  if (!o.isBlockContainer)
    throw new Error(
      `Attempted to merge block at position ${o.bnBlock.beforePos} into previous block at position ${t.bnBlock.beforePos}, but next block is not a block container`
    );
  if (o.childContainer) {
    const r = e.doc.resolve(
      o.childContainer.beforePos + 1
    ), s = e.doc.resolve(
      o.childContainer.afterPos - 1
    ), i = r.blockRange(s);
    if (n) {
      const a = e.doc.resolve(o.bnBlock.beforePos);
      e.tr.lift(i, a.depth);
    }
  }
  if (n) {
    if (!t.isBlockContainer)
      throw new Error(
        `Attempted to merge block at position ${o.bnBlock.beforePos} into previous block at position ${t.bnBlock.beforePos}, but previous block is not a block container`
      );
    n(
      e.tr.delete(
        t.blockContent.afterPos - 1,
        o.blockContent.beforePos + 1
      )
    );
  }
  return !0;
}, tn = (e) => ({
  state: n,
  dispatch: t
}) => {
  const o = n.doc.resolve(e), r = Te(o), s = _e(
    n.doc,
    r.bnBlock.beforePos
  );
  if (!s)
    return !1;
  const i = so(
    n.doc,
    s
  );
  return va(i, r) ? Sa(n, t, i, r) : !1;
}, Ea = U.create({
  priority: 50,
  // TODO: The shortcuts need a refactor. Do we want to use a command priority
  //  design as there is now, or clump the logic into a single function?
  addKeyboardShortcuts() {
    const e = () => this.editor.commands.first(({ chain: o, commands: r }) => [
      // Deletes the selection if it's not empty.
      () => r.deleteSelection(),
      // Undoes an input rule if one was triggered in the last editor state change.
      () => r.undoInputRule(),
      // Reverts block content type to a paragraph if the selection is at the start of the block.
      () => r.command(({ state: s }) => {
        const i = C(s);
        if (!i.isBlockContainer)
          return !1;
        const a = s.selection.from === i.blockContent.beforePos + 1, c = i.blockContent.node.type.name === "paragraph";
        return a && !c ? r.command(
          O(i.bnBlock.beforePos, {
            type: "paragraph",
            props: {}
          })
        ) : !1;
      }),
      // Removes a level of nesting if the block is indented if the selection is at the start of the block.
      () => r.command(({ state: s }) => {
        const i = C(s);
        if (!i.isBlockContainer)
          return !1;
        const { blockContent: a } = i;
        return s.selection.from === a.beforePos + 1 ? r.liftListItem("blockContainer") : !1;
      }),
      // Merges block with the previous one if it isn't indented, and the selection is at the start of the
      // block. The target block for merging must contain inline content.
      () => r.command(({ state: s }) => {
        const i = C(s);
        if (!i.isBlockContainer)
          return !1;
        const { bnBlock: a, blockContent: c } = i, l = s.selection.from === c.beforePos + 1, d = s.selection.empty, u = a.beforePos;
        return l && d ? o().command(tn(u)).scrollIntoView().run() : !1;
      }),
      () => r.command(({ state: s, dispatch: i }) => {
        const a = C(s);
        if (!a.isBlockContainer || !(s.selection.from === a.blockContent.beforePos + 1) || _e(
          s.doc,
          a.bnBlock.beforePos
        ))
          return !1;
        const d = en(
          s.doc,
          a.bnBlock.beforePos
        );
        if ((d == null ? void 0 : d.blockNoteType) !== "column")
          return !1;
        const u = d, h = en(
          s.doc,
          u.bnBlock.beforePos
        );
        if ((h == null ? void 0 : h.blockNoteType) !== "columnList")
          throw new Error("parent of column is not a column list");
        const f = u.childContainer.node.childCount === 1, m = f && h.childContainer.node.childCount === 2, g = h.childContainer.node.firstChild === u.bnBlock.node;
        if (i) {
          const b = s.doc.slice(
            a.bnBlock.beforePos,
            a.bnBlock.afterPos,
            !1
          );
          if (m)
            if (g) {
              s.tr.step(
                new rt(
                  // replace entire column list
                  h.bnBlock.beforePos,
                  h.bnBlock.afterPos,
                  // select content of remaining column:
                  u.bnBlock.afterPos + 1,
                  h.bnBlock.afterPos - 2,
                  b,
                  b.size,
                  // append existing content to blockToMove
                  !1
                )
              );
              const k = s.tr.doc.resolve(u.bnBlock.beforePos);
              s.tr.setSelection(H.between(k, k));
            } else {
              s.tr.step(
                new rt(
                  // replace entire column list
                  h.bnBlock.beforePos,
                  h.bnBlock.afterPos,
                  // select content of existing column:
                  h.bnBlock.beforePos + 2,
                  u.bnBlock.beforePos - 1,
                  b,
                  0,
                  // prepend existing content to blockToMove
                  !1
                )
              );
              const k = s.tr.doc.resolve(
                s.tr.mapping.map(u.bnBlock.beforePos - 1)
              );
              s.tr.setSelection(H.between(k, k));
            }
          else if (f)
            if (g) {
              s.tr.delete(
                u.bnBlock.beforePos,
                u.bnBlock.afterPos
              ), s.tr.insert(
                h.bnBlock.beforePos,
                b.content
              );
              const k = s.tr.doc.resolve(
                h.bnBlock.beforePos
              );
              s.tr.setSelection(H.between(k, k));
            } else
              s.tr.delete(
                u.bnBlock.beforePos - 1,
                u.bnBlock.beforePos + 1
              );
          else {
            s.tr.delete(
              a.bnBlock.beforePos,
              a.bnBlock.afterPos
            ), g ? s.tr.insert(
              h.bnBlock.beforePos - 1,
              b.content
            ) : s.tr.insert(
              u.bnBlock.beforePos - 1,
              b.content
            );
            const k = s.tr.doc.resolve(u.bnBlock.beforePos - 1);
            s.tr.setSelection(H.between(k, k));
          }
        }
        return !0;
      }),
      // Deletes the current block if it's an empty block with inline content,
      // and moves the selection to the previous block.
      () => r.command(({ state: s }) => {
        const i = C(s);
        if (!i.isBlockContainer)
          return !1;
        if (i.blockContent.node.childCount === 0 && i.blockContent.node.type.spec.content === "inline*") {
          const c = _e(
            s.doc,
            i.bnBlock.beforePos
          );
          if (!c || !c.isBlockContainer)
            return !1;
          let l = o();
          if (c.blockContent.node.type.spec.content === "tableRow+") {
            const m = i.bnBlock.beforePos - 1 - 1 - 1 - 1 - 1;
            l = l.setTextSelection(
              m
            );
          } else if (c.blockContent.node.type.spec.content === "") {
            const d = c.blockContent.afterPos - c.blockContent.node.nodeSize;
            l = l.setNodeSelection(
              d
            );
          } else {
            const d = c.blockContent.afterPos - c.blockContent.node.nodeSize;
            l = l.setTextSelection(d);
          }
          return l.deleteRange({
            from: i.bnBlock.beforePos,
            to: i.bnBlock.afterPos
          }).scrollIntoView().run();
        }
        return !1;
      }),
      // Deletes previous block if it contains no content and isn't a table,
      // when the selection is empty and at the start of the block. Moves the
      // current block into the deleted block's place.
      () => r.command(({ state: s }) => {
        const i = C(s);
        if (!i.isBlockContainer)
          throw new Error("todo");
        const a = s.selection.from === i.blockContent.beforePos + 1, c = s.selection.empty, l = _e(
          s.doc,
          i.bnBlock.beforePos
        );
        if (l && a && c) {
          const d = so(
            s.doc,
            l
          );
          if (!d.isBlockContainer)
            throw new Error("todo");
          if (d.blockContent.node.type.spec.content === "" || d.blockContent.node.type.spec.content === "inline*" && d.blockContent.node.childCount === 0)
            return o().cut(
              {
                from: i.bnBlock.beforePos,
                to: i.bnBlock.afterPos
              },
              d.bnBlock.afterPos
            ).deleteRange({
              from: d.bnBlock.beforePos,
              to: d.bnBlock.afterPos
            }).run();
        }
        return !1;
      })
    ]), n = () => this.editor.commands.first(({ commands: o }) => [
      // Deletes the selection if it's not empty.
      () => o.deleteSelection(),
      // Merges block with the next one (at the same nesting level or lower),
      // if one exists, the block has no children, and the selection is at the
      // end of the block.
      () => o.command(({ state: r }) => {
        const s = C(r);
        if (!s.isBlockContainer)
          return !1;
        const {
          bnBlock: i,
          blockContent: a,
          childContainer: c
        } = s, { depth: l } = r.doc.resolve(i.beforePos), d = i.afterPos === r.doc.nodeSize - 3, u = r.selection.from === a.afterPos - 1, h = r.selection.empty;
        if (!d && u && h && !(c !== void 0)) {
          let m = l, g = i.afterPos + 1, b = r.doc.resolve(g).depth;
          for (; b < m; )
            m = b, g += 2, b = r.doc.resolve(g).depth;
          return o.command(tn(g - 1));
        }
        return !1;
      })
    ]), t = (o = !1) => this.editor.commands.first(({ commands: r, tr: s }) => [
      // Removes a level of nesting if the block is empty & indented, while the selection is also empty & at the start
      // of the block.
      () => r.command(({ state: i }) => {
        const a = C(i);
        if (!a.isBlockContainer)
          return !1;
        const { bnBlock: c, blockContent: l } = a, { depth: d } = i.doc.resolve(c.beforePos), u = i.selection.$anchor.parentOffset === 0, h = i.selection.anchor === i.selection.head, f = l.node.childCount === 0, m = d > 1;
        return u && h && f && m ? r.liftListItem("blockContainer") : !1;
      }),
      // Creates a hard break if block is configured to do so.
      () => r.command(({ state: i }) => {
        const a = C(i), c = this.options.editor.schema.blockSchema[a.blockNoteType].hardBreakShortcut ?? "shift+enter";
        if (c === "none")
          return !1;
        if (
          // If shortcut is not configured, or is configured as "shift+enter",
          // create a hard break for shift+enter, but not for enter.
          c === "shift+enter" && o || // If shortcut is configured as "enter", create a hard break for
          // both enter and shift+enter.
          c === "enter"
        ) {
          const l = s.storedMarks || s.selection.$head.marks().filter(
            (d) => this.editor.extensionManager.splittableMarks.includes(
              d.type.name
            )
          );
          return s.insert(
            s.selection.head,
            s.doc.type.schema.nodes.hardBreak.create()
          ).ensureMarks(l), !0;
        }
        return !1;
      }),
      // Creates a new block and moves the selection to it if the current one is empty, while the selection is also
      // empty & at the start of the block.
      () => r.command(({ state: i, dispatch: a }) => {
        const c = C(i);
        if (!c.isBlockContainer)
          return !1;
        const { bnBlock: l, blockContent: d } = c, u = i.selection.$anchor.parentOffset === 0, h = i.selection.anchor === i.selection.head, f = d.node.childCount === 0;
        if (u && h && f) {
          const m = l.afterPos, g = m + 2;
          if (a) {
            const b = i.schema.nodes.blockContainer.createAndFill();
            i.tr.insert(m, b).scrollIntoView(), i.tr.setSelection(
              new H(i.doc.resolve(g))
            );
          }
          return !0;
        }
        return !1;
      }),
      // Splits the current block, moving content inside that's after the cursor to a new text block below. Also
      // deletes the selection beforehand, if it's not empty.
      () => r.command(({ state: i, chain: a }) => {
        const c = C(i);
        if (!c.isBlockContainer)
          return !1;
        const { blockContent: l } = c, d = i.selection.$anchor.parentOffset === 0;
        return l.node.childCount === 0 ? !1 : (a().deleteSelection().command(
          Rn(
            i.selection.from,
            d,
            d
          )
        ).run(), !0);
      })
    ]);
    return {
      Backspace: e,
      Delete: n,
      Enter: () => t(),
      "Shift-Enter": () => t(!0),
      // Always returning true for tab key presses ensures they're not captured by the browser. Otherwise, they blur the
      // editor since the browser will try to use tab for keyboard navigation.
      Tab: () => {
        var o, r, s;
        return this.options.tabBehavior !== "prefer-indent" && ((o = this.options.editor.formattingToolbar) != null && o.shown || (r = this.options.editor.linkToolbar) != null && r.shown || (s = this.options.editor.filePanel) != null && s.shown) ? !1 : Jn(this.options.editor);
      },
      "Shift-Tab": () => {
        var o, r, s;
        return this.options.tabBehavior !== "prefer-indent" && ((o = this.options.editor.formattingToolbar) != null && o.shown || (r = this.options.editor.linkToolbar) != null && r.shown || (s = this.options.editor.filePanel) != null && s.shown) ? !1 : (this.editor.commands.liftListItem("blockContainer"), !0);
      },
      "Shift-Mod-ArrowUp": () => (this.options.editor.moveBlocksUp(), !0),
      "Shift-Mod-ArrowDown": () => (this.options.editor.moveBlocksDown(), !0),
      "Mod-z": () => this.options.editor.undo(),
      "Mod-y": () => this.options.editor.redo(),
      "Shift-Mod-z": () => this.options.editor.redo()
    };
  }
});
class Ba {
  constructor(n, t, o) {
    p(this, "state");
    p(this, "emitUpdate");
    p(this, "menuUpdateTimer");
    p(this, "startMenuUpdateTimer");
    p(this, "stopMenuUpdateTimer");
    p(this, "mouseHoveredLinkMark");
    p(this, "mouseHoveredLinkMarkRange");
    p(this, "keyboardHoveredLinkMark");
    p(this, "keyboardHoveredLinkMarkRange");
    p(this, "linkMark");
    p(this, "linkMarkRange");
    p(this, "mouseOverHandler", (n) => {
      if (this.mouseHoveredLinkMark = void 0, this.mouseHoveredLinkMarkRange = void 0, this.stopMenuUpdateTimer(), n.target instanceof HTMLAnchorElement && n.target.nodeName === "A") {
        const t = n.target, o = this.pmView.posAtDOM(t, 0) + 1, r = this.pmView.state.doc.resolve(o), s = r.marks();
        for (const i of s)
          if (i.type.name === this.pmView.state.schema.mark("link").type.name) {
            this.mouseHoveredLinkMark = i, this.mouseHoveredLinkMarkRange = At(r, i.type, i.attrs) || void 0;
            break;
          }
      }
      return this.startMenuUpdateTimer(), !1;
    });
    p(this, "clickHandler", (n) => {
      var o;
      const t = this.pmView.dom.parentElement;
      // Toolbar is open.
      this.linkMark && // An element is clicked.
      n && n.target && // The clicked element is not the editor.
      !(t === n.target || t.contains(n.target)) && (o = this.state) != null && o.show && (this.state.show = !1, this.emitUpdate());
    });
    p(this, "scrollHandler", () => {
      var n;
      this.linkMark !== void 0 && (n = this.state) != null && n.show && (this.state.referencePos = Ue(
        this.pmView,
        this.linkMarkRange.from,
        this.linkMarkRange.to
      ), this.emitUpdate());
    });
    p(this, "closeMenu", () => {
      var n;
      (n = this.state) != null && n.show && (this.state.show = !1, this.emitUpdate());
    });
    this.editor = n, this.pmView = t, this.emitUpdate = () => {
      if (!this.state)
        throw new Error("Attempting to update uninitialized link toolbar");
      o(this.state);
    }, this.startMenuUpdateTimer = () => {
      this.menuUpdateTimer = setTimeout(() => {
        this.update(this.pmView, void 0, !0);
      }, 250);
    }, this.stopMenuUpdateTimer = () => (this.menuUpdateTimer && (clearTimeout(this.menuUpdateTimer), this.menuUpdateTimer = void 0), !1), this.pmView.dom.addEventListener("mouseover", this.mouseOverHandler), this.pmView.root.addEventListener(
      "click",
      this.clickHandler,
      !0
    ), this.pmView.root.addEventListener("scroll", this.scrollHandler, !0);
  }
  editLink(n, t) {
    var o;
    this.editor.transact((r) => {
      const s = A(r);
      r.insertText(t, this.linkMarkRange.from, this.linkMarkRange.to), r.addMark(
        this.linkMarkRange.from,
        this.linkMarkRange.from + t.length,
        s.mark("link", { href: n })
      );
    }), this.pmView.focus(), (o = this.state) != null && o.show && (this.state.show = !1, this.emitUpdate());
  }
  deleteLink() {
    var n;
    this.editor.transact(
      (t) => t.removeMark(
        this.linkMarkRange.from,
        this.linkMarkRange.to,
        this.linkMark.type
      ).setMeta("preventAutolink", !0)
    ), this.pmView.focus(), (n = this.state) != null && n.show && (this.state.show = !1, this.emitUpdate());
  }
  update(n, t, o = !1) {
    var a;
    const { state: r } = n;
    if (t && t.selection.from === r.selection.from && t.selection.to === r.selection.to || !this.pmView.hasFocus())
      return;
    const i = this.linkMark;
    if (this.linkMark = void 0, this.linkMarkRange = void 0, this.keyboardHoveredLinkMark = void 0, this.keyboardHoveredLinkMarkRange = void 0, this.pmView.state.selection.empty) {
      const c = this.pmView.state.selection.$from.marks();
      for (const l of c)
        if (l.type.name === this.pmView.state.schema.mark("link").type.name) {
          this.keyboardHoveredLinkMark = l, this.keyboardHoveredLinkMarkRange = At(
            this.pmView.state.selection.$from,
            l.type,
            l.attrs
          ) || void 0;
          break;
        }
    }
    if (this.mouseHoveredLinkMark && o && (this.linkMark = this.mouseHoveredLinkMark, this.linkMarkRange = this.mouseHoveredLinkMarkRange), this.keyboardHoveredLinkMark && (this.linkMark = this.keyboardHoveredLinkMark, this.linkMarkRange = this.keyboardHoveredLinkMarkRange), this.linkMark && this.editor.isEditable) {
      this.state = {
        show: !0,
        referencePos: Ue(
          this.pmView,
          this.linkMarkRange.from,
          this.linkMarkRange.to
        ),
        url: this.linkMark.attrs.href,
        text: this.pmView.state.doc.textBetween(
          this.linkMarkRange.from,
          this.linkMarkRange.to
        )
      }, this.emitUpdate();
      return;
    }
    if ((a = this.state) != null && a.show && i && (!this.linkMark || !this.editor.isEditable)) {
      this.state.show = !1, this.emitUpdate();
      return;
    }
  }
  destroy() {
    this.pmView.dom.removeEventListener("mouseover", this.mouseOverHandler), this.pmView.root.removeEventListener("scroll", this.scrollHandler, !0), this.pmView.root.removeEventListener(
      "click",
      this.clickHandler,
      !0
    );
  }
}
const xa = new V("LinkToolbarPlugin");
class Ma extends L {
  constructor(t) {
    super();
    p(this, "view");
    /**
     * Edit the currently hovered link.
     */
    p(this, "editLink", (t, o) => {
      this.view.editLink(t, o);
    });
    /**
     * Delete the currently hovered link.
     */
    p(this, "deleteLink", () => {
      this.view.deleteLink();
    });
    /**
     * When hovering on/off links using the mouse cursor, the link toolbar will
     * open & close with a delay.
     *
     * This function starts the delay timer, and should be used for when the mouse
     * cursor enters the link toolbar.
     */
    p(this, "startHideTimer", () => {
      this.view.startMenuUpdateTimer();
    });
    /**
     * When hovering on/off links using the mouse cursor, the link toolbar will
     * open & close with a delay.
     *
     * This function stops the delay timer, and should be used for when the mouse
     * cursor exits the link toolbar.
     */
    p(this, "stopHideTimer", () => {
      this.view.stopMenuUpdateTimer();
    });
    p(this, "closeMenu", () => this.view.closeMenu());
    this.addProsemirrorPlugin(
      new I({
        key: xa,
        view: (o) => (this.view = new Ba(t, o, (r) => {
          this.emit("update", r);
        }), this.view),
        props: {
          handleKeyDown: (o, r) => r.key === "Escape" && this.shown ? (this.view.closeMenu(), !0) : !1
        }
      })
    );
  }
  static key() {
    return "linkToolbar";
  }
  onUpdate(t) {
    return this.on("update", t);
  }
  get shown() {
    var t, o;
    return ((o = (t = this.view) == null ? void 0 : t.state) == null ? void 0 : o.show) || !1;
  }
}
const Ta = [
  "http",
  "https",
  "ftp",
  "ftps",
  "mailto",
  "tel",
  "callto",
  "sms",
  "cid",
  "xmpp"
], Pa = "https", Ia = new V("node-selection-keyboard");
class La extends L {
  static key() {
    return "nodeSelectionKeyboard";
  }
  constructor() {
    super(), this.addProsemirrorPlugin(
      new I({
        key: Ia,
        props: {
          handleKeyDown: (n, t) => {
            if ("node" in n.state.selection) {
              if (t.ctrlKey || t.metaKey)
                return !1;
              if (t.key.length === 1)
                return t.preventDefault(), !0;
              if (t.key === "Enter" && !t.shiftKey && !t.altKey && !t.ctrlKey && !t.metaKey) {
                const o = n.state.tr;
                return n.dispatch(
                  o.insert(
                    n.state.tr.selection.$to.after(),
                    n.state.schema.nodes.paragraph.createChecked()
                  ).setSelection(
                    new H(
                      o.doc.resolve(n.state.tr.selection.$to.after() + 1)
                    )
                  )
                ), !0;
              }
            }
            return !1;
          }
        }
      })
    );
  }
}
const Aa = new V("blocknote-placeholder");
class Na extends L {
  static key() {
    return "placeholder";
  }
  constructor(n, t) {
    super(), this.addProsemirrorPlugin(
      new I({
        key: Aa,
        view: (o) => {
          var l, d;
          const r = `placeholder-selector-${hn()}`;
          o.dom.classList.add(r);
          const s = document.createElement("style"), i = n._tiptapEditor.options.injectNonce;
          i && s.setAttribute("nonce", i), ((l = n.prosemirrorView) == null ? void 0 : l.root) instanceof ShadowRoot ? n.prosemirrorView.root.append(s) : (d = n.prosemirrorView) == null || d.root.head.appendChild(s);
          const a = s.sheet, c = (u = "") => `.${r} .bn-block-content${u} .bn-inline-content:has(> .ProseMirror-trailingBreak:only-child):before`;
          try {
            const {
              default: u,
              emptyDocument: h,
              ...f
            } = t;
            for (const [b, k] of Object.entries(f)) {
              const w = `[data-content-type="${b}"]`;
              a.insertRule(
                `${c(w)} { content: ${JSON.stringify(
                  k
                )}; }`
              );
            }
            const m = "[data-is-only-empty-block]", g = "[data-is-empty-and-focused]";
            a.insertRule(
              `${c(m)} { content: ${JSON.stringify(
                h
              )}; }`
            ), a.insertRule(
              `${c(g)} { content: ${JSON.stringify(
                u
              )}; }`
            );
          } catch (u) {
            console.warn(
              "Failed to insert placeholder CSS rule - this is likely due to the browser not supporting certain CSS pseudo-element selectors (:has, :only-child:, or :before)",
              u
            );
          }
          return {
            destroy: () => {
              var u, h;
              ((u = n.prosemirrorView) == null ? void 0 : u.root) instanceof ShadowRoot ? n.prosemirrorView.root.removeChild(s) : (h = n.prosemirrorView) == null || h.root.head.removeChild(s);
            }
          };
        },
        props: {
          decorations: (o) => {
            const { doc: r, selection: s } = o;
            if (!n.isEditable || !s.empty || s.$from.parent.type.spec.code)
              return;
            const i = [];
            o.doc.content.size === 6 && i.push(
              Q.node(2, 4, {
                "data-is-only-empty-block": "true"
              })
            );
            const a = s.$anchor, c = a.parent;
            if (c.content.size === 0) {
              const l = a.before();
              i.push(
                Q.node(l, l + c.nodeSize, {
                  "data-is-empty-and-focused": "true"
                })
              );
            }
            return q.create(r, i);
          }
        }
      })
    );
  }
}
const nn = new V("previous-blocks"), Ha = {
  // Numbered List Items
  index: "index",
  // Headings
  level: "level",
  // All Blocks
  type: "type",
  depth: "depth",
  "depth-change": "depth-change"
};
class Da extends L {
  static key() {
    return "previousBlockType";
  }
  constructor() {
    super();
    let n;
    this.addProsemirrorPlugin(
      new I({
        key: nn,
        view(t) {
          return {
            update: async (o, r) => {
              var s;
              ((s = this.key) == null ? void 0 : s.getState(o.state).updatedBlocks.size) > 0 && (n = setTimeout(() => {
                o.dispatch(
                  o.state.tr.setMeta(nn, { clearUpdate: !0 })
                );
              }, 0));
            },
            destroy: () => {
              n && clearTimeout(n);
            }
          };
        },
        state: {
          init() {
            return {
              // Block attributes, by block ID, from just before the previous transaction.
              prevTransactionOldBlockAttrs: {},
              // Block attributes, by block ID, from just before the current transaction.
              currentTransactionOldBlockAttrs: {},
              // Set of IDs of blocks whose attributes changed from the current transaction.
              updatedBlocks: /* @__PURE__ */ new Set()
            };
          },
          apply(t, o, r, s) {
            if (o.currentTransactionOldBlockAttrs = {}, o.updatedBlocks.clear(), !t.docChanged || r.doc.eq(s.doc))
              return o;
            const i = {}, a = Nt(
              r.doc,
              (d) => d.attrs.id
            ), c = new Map(
              a.map((d) => [d.node.attrs.id, d])
            ), l = Nt(
              s.doc,
              (d) => d.attrs.id
            );
            for (const d of l) {
              const u = c.get(d.node.attrs.id), h = u == null ? void 0 : u.node.firstChild, f = d.node.firstChild;
              if (u && h && f) {
                const m = {
                  index: f.attrs.index,
                  level: f.attrs.level,
                  type: f.type.name,
                  depth: s.doc.resolve(d.pos).depth
                };
                let g = {
                  index: h.attrs.index,
                  level: h.attrs.level,
                  type: h.type.name,
                  depth: r.doc.resolve(u.pos).depth
                };
                i[d.node.attrs.id] = g, t.getMeta("numberedListIndexing") && (d.node.attrs.id in o.prevTransactionOldBlockAttrs && (g = o.prevTransactionOldBlockAttrs[d.node.attrs.id]), m.type === "numberedListItem" && (g.index = m.index)), t.getMeta("customListIndexing") && (d.node.attrs.id in o.prevTransactionOldBlockAttrs && (g = o.prevTransactionOldBlockAttrs[d.node.attrs.id]), m.type === "customListItem" && (g.index = m.index)), o.currentTransactionOldBlockAttrs[d.node.attrs.id] = g, JSON.stringify(g) !== JSON.stringify(m) && (g["depth-change"] = g.depth - m.depth, o.updatedBlocks.add(d.node.attrs.id));
              }
            }
            return o.prevTransactionOldBlockAttrs = i, o;
          }
        },
        props: {
          decorations(t) {
            const o = this.getState(t);
            if (o.updatedBlocks.size === 0)
              return;
            const r = [];
            return t.doc.descendants((s, i) => {
              if (!s.attrs.id || !o.updatedBlocks.has(s.attrs.id))
                return;
              const a = o.currentTransactionOldBlockAttrs[s.attrs.id], c = {};
              for (const [d, u] of Object.entries(a))
                c["data-prev-" + Ha[d]] = u || "none";
              const l = Q.node(i, i + s.nodeSize, {
                ...c
              });
              r.push(l);
            }), q.create(t.doc, r);
          }
        }
      })
    );
  }
}
const on = new V("blocknote-show-selection");
class Oa extends L {
  constructor(t) {
    super();
    p(this, "enabled", !1);
    this.editor = t, this.addProsemirrorPlugin(
      new I({
        key: on,
        props: {
          decorations: (o) => {
            const { doc: r, selection: s } = o;
            if (!this.enabled)
              return q.empty;
            const i = Q.inline(s.from, s.to, {
              "data-show-selection": "true"
            });
            return q.create(r, [i]);
          }
        }
      })
    );
  }
  static key() {
    return "showSelection";
  }
  setEnabled(t) {
    this.enabled !== t && (this.enabled = t, this.editor.transact((o) => o.setMeta(on, {})));
  }
  getEnabled() {
    return this.enabled;
  }
}
function io(e, n) {
  var t, o;
  for (; e && e.parentElement && e.parentElement !== n.dom && ((t = e.getAttribute) == null ? void 0 : t.call(e, "data-node-type")) !== "blockContainer"; )
    e = e.parentElement;
  if (((o = e.getAttribute) == null ? void 0 : o.call(e, "data-node-type")) === "blockContainer")
    return { node: e, id: e.getAttribute("data-id") };
}
class ce extends Ve {
  constructor(t, o) {
    super(t, o);
    p(this, "nodes");
    const r = t.node();
    this.nodes = [], t.doc.nodesBetween(t.pos, o.pos, (s, i, a) => {
      if (a !== null && a.eq(r))
        return this.nodes.push(s), !1;
    });
  }
  static create(t, o, r = o) {
    return new ce(t.resolve(o), t.resolve(r));
  }
  content() {
    return new Z(R.from(this.nodes), 0, 0);
  }
  eq(t) {
    if (!(t instanceof ce) || this.nodes.length !== t.nodes.length || this.from !== t.from || this.to !== t.to)
      return !1;
    for (let o = 0; o < this.nodes.length; o++)
      if (!this.nodes[o].eq(t.nodes[o]))
        return !1;
    return !0;
  }
  map(t, o) {
    const r = o.mapResult(this.from), s = o.mapResult(this.to);
    return s.deleted ? Ve.near(t.resolve(r.pos)) : r.deleted ? Ve.near(t.resolve(s.pos)) : new ce(
      t.resolve(r.pos),
      t.resolve(s.pos)
    );
  }
  toJSON() {
    return { type: "multiple-node", anchor: this.anchor, head: this.head };
  }
}
Ve.jsonID("multiple-node", ce);
let G;
function Ra(e, n) {
  let t, o;
  const r = n.resolve(e.from).node().type.spec.group === "blockContent", s = n.resolve(e.to).node().type.spec.group === "blockContent", i = Math.min(e.$anchor.depth, e.$head.depth);
  if (r && s) {
    const a = e.$from.start(i - 1), c = e.$to.end(i - 1);
    t = n.resolve(a - 1).pos, o = n.resolve(c + 1).pos;
  } else
    t = e.from, o = e.to;
  return { from: t, to: o };
}
function rn(e, n, t = n) {
  n === t && (t += e.state.doc.resolve(n + 1).node().nodeSize);
  const o = e.domAtPos(n).node.cloneNode(!0), r = e.domAtPos(n).node, s = (u, h) => Array.prototype.indexOf.call(u.children, h), i = s(
    r,
    // Expects from position to be just before the first selected block.
    e.domAtPos(n + 1).node.parentElement
  ), a = s(
    r,
    // Expects to position to be just after the last selected block.
    e.domAtPos(t - 1).node.parentElement
  );
  for (let u = r.childElementCount - 1; u >= 0; u--)
    (u > a || u < i) && o.removeChild(o.children[u]);
  ao(e.root), G = o;
  const c = G.getElementsByTagName("iframe");
  for (let u = 0; u < c.length; u++) {
    const h = c[u], f = h.parentElement;
    f && f.removeChild(h);
  }
  const d = e.dom.className.split(" ").filter(
    (u) => u !== "ProseMirror" && u !== "bn-root" && u !== "bn-editor"
  ).join(" ");
  G.className = G.className + " bn-drag-preview " + d, e.root instanceof ShadowRoot ? e.root.appendChild(G) : e.root.body.appendChild(G);
}
function ao(e) {
  G !== void 0 && (e instanceof ShadowRoot ? e.removeChild(G) : e.body.removeChild(G), G = void 0);
}
function Va(e, n, t) {
  if (!e.dataTransfer)
    return;
  const o = t.prosemirrorView;
  if (!o)
    return;
  const r = F(n.id, o.state.doc);
  if (!r)
    throw new Error(`Block with ID ${n.id} not found`);
  const s = r.posBeforeNode;
  if (s != null) {
    const i = o.state.selection, a = o.state.doc, { from: c, to: l } = Ra(i, a), d = c <= s && s < l, u = i.$anchor.node() !== i.$head.node() || i instanceof ce;
    d && u ? (o.dispatch(
      o.state.tr.setSelection(ce.create(a, c, l))
    ), rn(o, c, l)) : (o.dispatch(
      o.state.tr.setSelection(be.create(o.state.doc, s))
    ), rn(o, s));
    const h = o.state.selection.content(), f = t.pmSchema, m = o.serializeForClipboard(h).dom.innerHTML, g = Ye(f, t), b = no(h.content), k = g.exportBlocks(b, {}), w = Pt(k);
    e.dataTransfer.clearData(), e.dataTransfer.setData("blocknote/html", m), e.dataTransfer.setData("text/html", k), e.dataTransfer.setData("text/plain", w), e.dataTransfer.effectAllowed = "move", e.dataTransfer.setDragImage(G, 0, 0);
  }
}
const sn = 250;
function gt(e, n, t = !0) {
  const o = e.root.elementsFromPoint(n.left, n.top);
  for (const r of o)
    if (e.dom.contains(r))
      return t && r.closest("[data-node-type=columnList]") ? gt(
        e,
        {
          // TODO can we do better than this?
          left: n.left + 50,
          // bit hacky, but if we're inside a column, offset x position to right to account for the width of sidemenu itself
          top: n.top
        },
        !1
      ) : io(r, e);
}
function _a(e, n) {
  if (!n.dom.firstChild)
    return;
  const t = n.dom.firstChild.getBoundingClientRect(), o = {
    // Clamps the x position to the editor's bounding box.
    left: Math.min(
      Math.max(t.left + 10, e.x),
      t.right - 10
    ),
    top: e.y
  }, r = gt(n, o);
  if (!r)
    return;
  const s = r.node.getBoundingClientRect();
  return gt(
    n,
    {
      left: s.right - 10,
      top: e.y
    },
    !1
  );
}
class Ua {
  constructor(n, t, o) {
    p(this, "state");
    p(this, "emitUpdate");
    p(this, "mousePos");
    p(this, "hoveredBlock");
    p(this, "menuFrozen", !1);
    p(this, "isDragOrigin", !1);
    p(this, "updateState", (n) => {
      this.state = n, this.emitUpdate(this.state);
    });
    p(this, "updateStateFromMousePos", () => {
      var o, r, s, i, a;
      if (this.menuFrozen || !this.mousePos)
        return;
      const n = this.findClosestEditorElement({
        clientX: this.mousePos.x,
        clientY: this.mousePos.y
      });
      if ((n == null ? void 0 : n.element) !== this.pmView.dom || n.distance > sn) {
        (o = this.state) != null && o.show && (this.state.show = !1, this.updateState(this.state));
        return;
      }
      const t = _a(this.mousePos, this.pmView);
      if (!t || !this.editor.isEditable) {
        (r = this.state) != null && r.show && (this.state.show = !1, this.updateState(this.state));
        return;
      }
      if (!((s = this.state) != null && s.show && ((i = this.hoveredBlock) != null && i.hasAttribute("data-id")) && ((a = this.hoveredBlock) == null ? void 0 : a.getAttribute("data-id")) === t.id) && (this.hoveredBlock = t.node, this.editor.isEditable)) {
        const c = t.node.getBoundingClientRect(), l = t.node.closest("[data-node-type=column]");
        this.state = {
          show: !0,
          referencePos: new DOMRect(
            l ? (
              // We take the first child as column elements have some default
              // padding. This is a little weird since this child element will
              // be the first block, but since it's always non-nested and we
              // only take the x coordinate, it's ok.
              l.firstElementChild.getBoundingClientRect().x
            ) : this.pmView.dom.firstChild.getBoundingClientRect().x,
            c.y,
            c.width,
            c.height
          ),
          block: this.editor.getBlock(
            this.hoveredBlock.getAttribute("data-id")
          )
        }, this.updateState(this.state);
      }
    });
    /**
     * If a block is being dragged, ProseMirror usually gets the context of what's
     * being dragged from `view.dragging`, which is automatically set when a
     * `dragstart` event fires in the editor. However, if the user tries to drag
     * and drop blocks between multiple editors, only the one in which the drag
     * began has that context, so we need to set it on the others manually. This
     * ensures that PM always drops the blocks in between other blocks, and not
     * inside them.
     *
     * After the `dragstart` event fires on the drag handle, it sets
     * `blocknote/html` data on the clipboard. This handler fires right after,
     * parsing the `blocknote/html` data into nodes and setting them on
     * `view.dragging`.
     *
     * Note: Setting `view.dragging` on `dragover` would be better as the user
     * could then drag between editors in different windows, but you can only
     * access `dataTransfer` contents on `dragstart` and `drop` events.
     */
    p(this, "onDragStart", (n) => {
      var i;
      const t = (i = n.dataTransfer) == null ? void 0 : i.getData("blocknote/html");
      if (!t || this.pmView.dragging)
        return;
      const o = document.createElement("div");
      o.innerHTML = t;
      const s = Be.fromSchema(this.pmView.state.schema).parse(o, {
        topNode: this.pmView.state.schema.nodes.blockGroup.create()
      });
      this.pmView.dragging = {
        slice: new Z(s.content, 0, 0),
        move: !0
      };
    });
    /**
     * Finds the closest editor visually to the given coordinates
     */
    p(this, "findClosestEditorElement", (n) => {
      const t = Array.from(this.pmView.root.querySelectorAll(".bn-editor"));
      if (t.length === 0)
        return null;
      let o = t[0], r = Number.MAX_VALUE;
      return t.forEach((s) => {
        const i = s.querySelector(".bn-block-group").getBoundingClientRect(), a = n.clientX < i.left ? i.left - n.clientX : n.clientX > i.right ? n.clientX - i.right : 0, c = n.clientY < i.top ? i.top - n.clientY : n.clientY > i.bottom ? n.clientY - i.bottom : 0, l = Math.sqrt(
          Math.pow(a, 2) + Math.pow(c, 2)
        );
        l < r && (r = l, o = s);
      }), {
        element: o,
        distance: r
      };
    });
    /**
     * This dragover event handler listens at the document level,
     * and is trying to handle dragover events for all editors.
     *
     * It specifically is trying to handle the following cases:
     *  - If the dragover event is within the bounds of any editor, then it does nothing
     *  - If the dragover event is outside the bounds of any editor, but close enough (within DISTANCE_TO_CONSIDER_EDITOR_BOUNDS) to the closest editor,
     *    then it dispatches a synthetic dragover event to the closest editor (which will trigger the drop-cursor to be shown on that editor)
     *  - If the dragover event is outside the bounds of the current editor, then it will dispatch a synthetic dragleave event to the current editor
     *    (which will trigger the drop-cursor to be removed from the current editor)
     *
     * The synthetic event is a necessary evil because we do not control prosemirror-dropcursor to be able to show the drop-cursor within the range we want
     */
    p(this, "onDragOver", (n) => {
      if (n.synthetic)
        return;
      const t = this.getDragEventContext(n);
      if (!t || !t.isDropPoint) {
        this.closeDropCursor();
        return;
      }
      t.isDropPoint && !t.isDropWithinEditorBounds && this.dispatchSyntheticEvent(n);
    });
    /**
     * Closes the drop-cursor for the current editor
     */
    p(this, "closeDropCursor", () => {
      const n = new Event("dragleave", { bubbles: !1 });
      n.synthetic = !0, this.pmView.dom.dispatchEvent(n);
    });
    /**
     * It is surprisingly difficult to determine the information we need to know about a drag event
     *
     * This function is trying to determine the following:
     *  - Whether the current editor instance is the drop point
     *  - Whether the current editor instance is the drag origin
     *  - Whether the drop event is within the bounds of the current editor instance
     */
    p(this, "getDragEventContext", (n) => {
      var c;
      const t = !((c = n.dataTransfer) != null && c.types.includes("blocknote/html")) && !!this.pmView.dragging, o = !!this.isDragOrigin, r = t || o, s = this.findClosestEditorElement(n);
      if (!s || s.distance > sn)
        return;
      const i = s.element === this.pmView.dom, a = i && s.distance === 0;
      if (!(!i && !r))
        return {
          isDropPoint: i,
          isDropWithinEditorBounds: a,
          isDragOrigin: r
        };
    });
    /**
     * The drop event handler listens at the document level,
     * and handles drop events for all editors.
     *
     * It specifically handles the following cases:
     *  - If we are both the drag origin and drop point:
     *    - Let normal drop handling take over
     *  - If we are the drop point but not the drag origin:
     *    - Collapse selection to prevent PM from deleting unrelated content
     *    - If drop event is outside our editor bounds, dispatch synthetic drop event to our editor
     *  - If we are the drag origin but not the drop point:
     *    - Delete the dragged content from our editor after a delay
     */
    p(this, "onDrop", (n) => {
      if (n.synthetic)
        return;
      const t = this.getDragEventContext(n);
      if (!t) {
        this.closeDropCursor();
        return;
      }
      const { isDropPoint: o, isDropWithinEditorBounds: r, isDragOrigin: s } = t;
      if (!r && o && this.dispatchSyntheticEvent(n), o) {
        if (this.pmView.dragging)
          return;
        this.pmView.dispatch(
          this.pmView.state.tr.setSelection(
            H.create(
              this.pmView.state.tr.doc,
              this.pmView.state.tr.selection.anchor
            )
          )
        );
        return;
      } else if (s) {
        setTimeout(
          () => this.pmView.dispatch(this.pmView.state.tr.deleteSelection()),
          0
        );
        return;
      }
    });
    p(this, "onDragEnd", (n) => {
      n.synthetic || (this.pmView.dragging = null);
    });
    p(this, "onKeyDown", (n) => {
      var t;
      (t = this.state) != null && t.show && this.editor.isFocused() && (this.state.show = !1, this.emitUpdate(this.state));
    });
    p(this, "onMouseMove", (n) => {
      var s;
      if (this.menuFrozen)
        return;
      this.mousePos = { x: n.clientX, y: n.clientY };
      const t = this.pmView.dom.getBoundingClientRect(), o = this.mousePos.x > t.left && this.mousePos.x < t.right && this.mousePos.y > t.top && this.mousePos.y < t.bottom, r = this.pmView.dom.parentElement;
      if (
        // Cursor is within the editor area
        o && // An element is hovered
        n && n.target && // Element is outside the editor
        !(r === n.target || r.contains(n.target))
      ) {
        (s = this.state) != null && s.show && (this.state.show = !1, this.emitUpdate(this.state));
        return;
      }
      this.updateStateFromMousePos();
    });
    p(this, "onScroll", () => {
      var n;
      (n = this.state) != null && n.show && (this.state.referencePos = this.hoveredBlock.getBoundingClientRect(), this.emitUpdate(this.state)), this.updateStateFromMousePos();
    });
    this.editor = n, this.pmView = t, this.emitUpdate = () => {
      if (!this.state)
        throw new Error("Attempting to update uninitialized side menu");
      o(this.state);
    }, this.pmView.root.addEventListener(
      "dragstart",
      this.onDragStart
    ), this.pmView.root.addEventListener(
      "dragover",
      this.onDragOver
    ), this.pmView.root.addEventListener(
      "drop",
      this.onDrop,
      !0
    ), this.pmView.root.addEventListener(
      "dragend",
      this.onDragEnd,
      !0
    ), Tt(), this.pmView.root.addEventListener(
      "mousemove",
      this.onMouseMove,
      !0
    ), this.pmView.root.addEventListener(
      "keydown",
      this.onKeyDown,
      !0
    ), t.root.addEventListener("scroll", this.onScroll, !0);
  }
  dispatchSyntheticEvent(n) {
    const t = new Event(n.type, n), o = this.pmView.dom.firstChild.getBoundingClientRect();
    t.clientX = n.clientX, t.clientY = n.clientY, t.clientX = Math.min(
      Math.max(n.clientX, o.left),
      o.left + o.width
    ), t.clientY = Math.min(
      Math.max(n.clientY, o.top),
      o.top + o.height
    ), t.dataTransfer = n.dataTransfer, t.preventDefault = () => n.preventDefault(), t.synthetic = !0, this.pmView.dom.dispatchEvent(t);
  }
  // Needed in cases where the editor state updates without the mouse cursor
  // moving, as some state updates can require a side menu update. For example,
  // adding a button to the side menu which removes the block can cause the
  // block below to jump up into the place of the removed block when clicked,
  // allowing the user to click the button again without moving the cursor. This
  // would otherwise not update the side menu, and so clicking the button again
  // would attempt to remove the same block again, causing an error.
  update(n, t) {
    var r;
    !t.doc.eq(this.pmView.state.doc) && ((r = this.state) != null && r.show) && this.updateStateFromMousePos();
  }
  destroy() {
    var n;
    (n = this.state) != null && n.show && (this.state.show = !1, this.emitUpdate(this.state)), this.pmView.root.removeEventListener(
      "mousemove",
      this.onMouseMove,
      !0
    ), this.pmView.root.removeEventListener(
      "dragstart",
      this.onDragStart
    ), this.pmView.root.removeEventListener(
      "dragover",
      this.onDragOver
    ), this.pmView.root.removeEventListener(
      "drop",
      this.onDrop,
      !0
    ), this.pmView.root.removeEventListener(
      "dragend",
      this.onDragEnd,
      !0
    ), this.pmView.root.removeEventListener(
      "keydown",
      this.onKeyDown,
      !0
    ), this.pmView.root.removeEventListener("scroll", this.onScroll, !0);
  }
}
const $a = new V("SideMenuPlugin");
class Fa extends L {
  constructor(t) {
    super();
    p(this, "view");
    /**
     * Handles drag & drop events for blocks.
     */
    p(this, "blockDragStart", (t, o) => {
      this.view && (this.view.isDragOrigin = !0), Va(t, o, this.editor);
    });
    /**
     * Handles drag & drop events for blocks.
     */
    p(this, "blockDragEnd", () => {
      this.editor.prosemirrorView && ao(this.editor.prosemirrorView.root), this.view && (this.view.isDragOrigin = !1);
    });
    /**
     * Freezes the side menu. When frozen, the side menu will stay
     * attached to the same block regardless of which block is hovered by the
     * mouse cursor.
     */
    p(this, "freezeMenu", () => {
      this.view.menuFrozen = !0, this.view.state.show = !0, this.view.emitUpdate(this.view.state);
    });
    /**
     * Unfreezes the side menu. When frozen, the side menu will stay
     * attached to the same block regardless of which block is hovered by the
     * mouse cursor.
     */
    p(this, "unfreezeMenu", () => {
      this.view.menuFrozen = !1, this.view.state.show = !1, this.view.emitUpdate(this.view.state);
    });
    this.editor = t, this.addProsemirrorPlugin(
      new I({
        key: $a,
        view: (o) => (this.view = new Ua(t, o, (r) => {
          this.emit("update", r);
        }), this.view)
      })
    );
  }
  static key() {
    return "sideMenu";
  }
  onUpdate(t) {
    return this.on("update", t);
  }
}
const De = /* @__PURE__ */ new Map();
function za(e) {
  if (De.has(e))
    return De.get(e);
  const n = new ho();
  return e._tiptapEditor.on("transaction", ({ transaction: t }) => {
    n.appendMapping(t.mapping);
  }), e._tiptapEditor.on("destroy", () => {
    De.delete(e);
  }), De.set(e, n), n;
}
function Wa(e, n, t = "left") {
  const o = de.getState(
    e._tiptapEditor.state
  );
  if (!o) {
    const s = za(e), i = s.maps.length;
    return () => s.slice(i).map(n, t === "left" ? -1 : 1);
  }
  const r = Qo(
    // Track the position after the position if we are on the right side
    n + (t === "right" ? 1 : 0),
    o.binding.type,
    o.binding.mapping
  );
  return () => {
    const s = de.getState(
      e._tiptapEditor.state
    ), i = er(
      s.doc,
      s.binding.type,
      r,
      s.binding.mapping
    );
    if (i === null)
      throw new Error("Position not found, cannot track positions");
    return i + (t === "right" ? -1 : 0);
  };
}
const ja = wo((e) => e.type.name === "blockContainer");
class Ga {
  constructor(n, t) {
    p(this, "state");
    p(this, "emitUpdate");
    p(this, "rootEl");
    p(this, "pluginState");
    p(this, "handleScroll", () => {
      var n, t;
      if ((n = this.state) != null && n.show) {
        const o = (t = this.rootEl) == null ? void 0 : t.querySelector(
          `[data-decoration-id="${this.pluginState.decorationId}"]`
        );
        if (!o)
          return;
        this.state.referencePos = o.getBoundingClientRect(), this.emitUpdate(this.pluginState.triggerCharacter);
      }
    });
    p(this, "closeMenu", () => {
      this.editor.transact((n) => n.setMeta(ge, null));
    });
    p(this, "clearQuery", () => {
      this.pluginState !== void 0 && this.editor._tiptapEditor.chain().focus().deleteRange({
        from: this.pluginState.queryStartPos() - (this.pluginState.deleteTriggerCharacter ? this.pluginState.triggerCharacter.length : 0),
        to: this.editor.transact((n) => n.selection.from)
      }).run();
    });
    var o, r;
    this.editor = n, this.pluginState = void 0, this.emitUpdate = (s) => {
      var i;
      if (!this.state)
        throw new Error("Attempting to update uninitialized suggestions menu");
      t(s, {
        ...this.state,
        ignoreQueryLength: (i = this.pluginState) == null ? void 0 : i.ignoreQueryLength
      });
    }, this.rootEl = (o = this.editor.prosemirrorView) == null ? void 0 : o.root, (r = this.rootEl) == null || r.addEventListener("scroll", this.handleScroll, !0);
  }
  update(n, t) {
    var l;
    const o = ge.getState(t), r = ge.getState(
      n.state
    ), s = o === void 0 && r !== void 0, i = o !== void 0 && r === void 0;
    if (!s && !(o !== void 0 && r !== void 0) && !i)
      return;
    if (this.pluginState = i ? o : r, i || !this.editor.isEditable) {
      this.state && (this.state.show = !1), this.emitUpdate(this.pluginState.triggerCharacter);
      return;
    }
    const c = (l = this.rootEl) == null ? void 0 : l.querySelector(
      `[data-decoration-id="${this.pluginState.decorationId}"]`
    );
    this.editor.isEditable && c && (this.state = {
      show: !0,
      referencePos: c.getBoundingClientRect(),
      query: this.pluginState.query
    }, this.emitUpdate(this.pluginState.triggerCharacter));
  }
  destroy() {
    var n;
    (n = this.rootEl) == null || n.removeEventListener("scroll", this.handleScroll, !0);
  }
}
const ge = new V("SuggestionMenuPlugin");
class qa extends L {
  constructor(t) {
    super();
    p(this, "view");
    p(this, "triggerCharacters", []);
    p(this, "addTriggerCharacter", (t) => {
      this.triggerCharacters.push(t);
    });
    // TODO: Should this be called automatically when listeners are removed?
    p(this, "removeTriggerCharacter", (t) => {
      this.triggerCharacters = this.triggerCharacters.filter(
        (o) => o !== t
      );
    });
    p(this, "closeMenu", () => this.view.closeMenu());
    p(this, "clearQuery", () => this.view.clearQuery());
    const o = this.triggerCharacters;
    this.addProsemirrorPlugin(
      new I({
        key: ge,
        view: () => (this.view = new Ga(
          t,
          (r, s) => {
            this.emit(`update ${r}`, s);
          }
        ), this.view),
        state: {
          // Initialize the plugin's internal state.
          init() {
          },
          // Apply changes to the plugin state from an editor transaction.
          apply: (r, s, i, a) => {
            if (r.getMeta("orderedListIndexing") !== void 0 || r.selection.$from.parent.type.spec.code)
              return s;
            const c = r.getMeta(ge);
            if (typeof c == "object" && c !== null) {
              s && this.closeMenu();
              const d = Wa(
                t,
                a.selection.from - // Need to account for the trigger char that was inserted, so we offset the position by the length of the trigger character.
                c.triggerCharacter.length
              );
              return {
                triggerCharacter: c.triggerCharacter,
                deleteTriggerCharacter: c.deleteTriggerCharacter !== !1,
                // When reading the queryStartPos, we offset the result by the length of the trigger character, to make it easy on the caller
                queryStartPos: () => d() + c.triggerCharacter.length,
                query: "",
                decorationId: `id_${Math.floor(Math.random() * 4294967295)}`,
                ignoreQueryLength: c == null ? void 0 : c.ignoreQueryLength
              };
            }
            if (s === void 0)
              return s;
            if (
              // Highlighting text should hide the menu.
              a.selection.from !== a.selection.to || // Transactions with plugin metadata should hide the menu.
              c === null || // Certain mouse events should hide the menu.
              // TODO: Change to global mousedown listener.
              r.getMeta("focus") || r.getMeta("blur") || r.getMeta("pointer") || // Moving the caret before the character which triggered the menu should hide it.
              s.triggerCharacter !== void 0 && a.selection.from < s.queryStartPos() || // Moving the caret to a new block should hide the menu.
              !a.selection.$from.sameParent(
                a.doc.resolve(s.queryStartPos())
              )
            )
              return;
            const l = { ...s };
            return l.query = a.doc.textBetween(
              s.queryStartPos(),
              a.selection.from
            ), l;
          }
        },
        props: {
          handleTextInput(r, s, i, a) {
            if (s === i) {
              const c = r.state.doc;
              for (const l of o) {
                const d = l.length > 1 ? c.textBetween(s - l.length, s) + a : a;
                if (l === d)
                  return r.dispatch(r.state.tr.insertText(a)), r.dispatch(
                    r.state.tr.setMeta(ge, {
                      triggerCharacter: d
                    }).scrollIntoView()
                  ), !0;
              }
            }
            return !1;
          },
          // Setup decorator on the currently active suggestion.
          decorations(r) {
            const s = this.getState(r);
            if (s === void 0)
              return null;
            if (!s.deleteTriggerCharacter) {
              const i = ja(r.selection);
              if (i)
                return q.create(r.doc, [
                  Q.node(
                    i.pos,
                    i.pos + i.node.nodeSize,
                    {
                      nodeName: "span",
                      class: "bn-suggestion-decorator",
                      "data-decoration-id": s.decorationId
                    }
                  )
                ]);
            }
            return q.create(r.doc, [
              Q.inline(
                s.queryStartPos() - s.triggerCharacter.length,
                s.queryStartPos(),
                {
                  nodeName: "span",
                  class: "bn-suggestion-decorator",
                  "data-decoration-id": s.decorationId
                }
              )
            ]);
          }
        }
      })
    );
  }
  static key() {
    return "suggestionMenu";
  }
  onUpdate(t, o) {
    return this.triggerCharacters.includes(t) || this.addTriggerCharacter(t), this.on(`update ${t}`, o);
  }
  get shown() {
    var t, o;
    return ((o = (t = this.view) == null ? void 0 : t.state) == null ? void 0 : o.show) || !1;
  }
}
function al(e, n) {
  e.suggestionMenus.addTriggerCharacter(n);
}
const Ka = re.create({
  name: "insertion",
  inclusive: !1,
  excludes: "deletion modification insertion",
  addAttributes() {
    return {
      id: { default: null, validate: "number" }
      // note: validate is supported in prosemirror but not in tiptap, so this doesn't actually work (considered not critical)
    };
  },
  extendMarkSchema(e) {
    return e.name !== "insertion" ? {} : {
      blocknoteIgnore: !0,
      inclusive: !1,
      toDOM(n, t) {
        return [
          "ins",
          {
            "data-id": String(n.attrs.id),
            "data-inline": String(t),
            ...!t && { style: "display: contents" }
            // changed to "contents" to make this work for table rows
          },
          0
        ];
      },
      parseDOM: [
        {
          tag: "ins",
          getAttrs(n) {
            return n.dataset.id ? {
              id: parseInt(n.dataset.id, 10)
            } : !1;
          }
        }
      ]
    };
  }
}), Ya = re.create({
  name: "deletion",
  inclusive: !1,
  excludes: "insertion modification deletion",
  addAttributes() {
    return {
      id: { default: null, validate: "number" }
      // note: validate is supported in prosemirror but not in tiptap
    };
  },
  extendMarkSchema(e) {
    return e.name !== "deletion" ? {} : {
      blocknoteIgnore: !0,
      inclusive: !1,
      // attrs: {
      //   id: { validate: "number" },
      // },
      toDOM(n, t) {
        return [
          "del",
          {
            "data-id": String(n.attrs.id),
            "data-inline": String(t),
            ...!t && { style: "display: contents" }
            // changed to "contents" to make this work for table rows
          },
          0
        ];
      },
      parseDOM: [
        {
          tag: "del",
          getAttrs(n) {
            return n.dataset.id ? {
              id: parseInt(n.dataset.id, 10)
            } : !1;
          }
        }
      ]
    };
  }
}), Ja = re.create({
  name: "modification",
  inclusive: !1,
  excludes: "deletion insertion",
  addAttributes() {
    return {
      id: { default: null, validate: "number" },
      type: { validate: "string" },
      attrName: { default: null, validate: "string|null" },
      previousValue: { default: null },
      newValue: { default: null }
    };
  },
  extendMarkSchema(e) {
    return e.name !== "modification" ? {} : {
      blocknoteIgnore: !0,
      inclusive: !1,
      // attrs: {
      //   id: { validate: "number" },
      //   type: { validate: "string" },
      //   attrName: { default: null, validate: "string|null" },
      //   previousValue: { default: null },
      //   newValue: { default: null },
      // },
      toDOM(n, t) {
        return [
          t ? "span" : "div",
          {
            "data-type": "modification",
            "data-id": String(n.attrs.id),
            "data-mod-type": n.attrs.type,
            "data-mod-prev-val": JSON.stringify(n.attrs.previousValue),
            // TODO: Try to serialize marks with toJSON?
            "data-mod-new-val": JSON.stringify(n.attrs.newValue)
          },
          0
        ];
      },
      parseDOM: [
        {
          tag: "span[data-type='modification']",
          getAttrs(n) {
            return n.dataset.id ? {
              id: parseInt(n.dataset.id, 10),
              type: n.dataset.modType,
              previousValue: n.dataset.modPrevVal,
              newValue: n.dataset.modNewVal
            } : !1;
          }
        },
        {
          tag: "div[data-type='modification']",
          getAttrs(n) {
            return n.dataset.id ? {
              id: parseInt(n.dataset.id, 10),
              type: n.dataset.modType,
              previousValue: n.dataset.modPrevVal
            } : !1;
          }
        }
      ]
    };
  }
});
let _;
function an(e) {
  _ || (_ = document.createElement("div"), _.innerHTML = "_", _.style.opacity = "0", _.style.height = "1px", _.style.width = "1px", e instanceof Document ? e.body.appendChild(_) : e.appendChild(_));
}
function Xa(e) {
  _ && (e instanceof Document ? e.body.removeChild(_) : e.removeChild(_), _ = void 0);
}
function Oe(e) {
  return Array.prototype.indexOf.call(e.parentElement.childNodes, e);
}
function Za(e) {
  let n = e;
  for (; n && n.nodeName !== "TD" && n.nodeName !== "TH" && !n.classList.contains("tableWrapper"); ) {
    if (n.classList.contains("ProseMirror"))
      return;
    const t = n.parentNode;
    if (!t || !(t instanceof Element))
      return;
    n = t;
  }
  return n.nodeName === "TD" || n.nodeName === "TH" ? {
    type: "cell",
    domNode: n,
    tbodyNode: n.closest("tbody")
  } : {
    type: "wrapper",
    domNode: n,
    tbodyNode: n.querySelector("tbody")
  };
}
function Qa(e, n) {
  const t = n.querySelectorAll(e);
  for (let o = 0; o < t.length; o++)
    t[o].style.visibility = "hidden";
}
class ec {
  constructor(n, t, o) {
    p(this, "state");
    p(this, "emitUpdate");
    p(this, "tableId");
    p(this, "tablePos");
    p(this, "tableElement");
    p(this, "menuFrozen", !1);
    p(this, "mouseState", "up");
    p(this, "prevWasEditable", null);
    p(this, "viewMousedownHandler", () => {
      this.mouseState = "down";
    });
    p(this, "mouseUpHandler", (n) => {
      this.mouseState = "up", this.mouseMoveHandler(n);
    });
    p(this, "mouseMoveHandler", (n) => {
      var l, d, u, h, f, m, g;
      if (this.menuFrozen || this.mouseState === "selecting" || !(n.target instanceof Element) || !this.pmView.dom.contains(n.target))
        return;
      const t = Za(n.target);
      if ((t == null ? void 0 : t.type) === "cell" && this.mouseState === "down" && !((l = this.state) != null && l.draggingState)) {
        this.mouseState = "selecting", (d = this.state) != null && d.show && (this.state.show = !1, this.state.showAddOrRemoveRowsButton = !1, this.state.showAddOrRemoveColumnsButton = !1, this.emitUpdate());
        return;
      }
      if (!t || !this.editor.isEditable) {
        (u = this.state) != null && u.show && (this.state.show = !1, this.state.showAddOrRemoveRowsButton = !1, this.state.showAddOrRemoveColumnsButton = !1, this.emitUpdate());
        return;
      }
      if (!t.tbodyNode)
        return;
      const o = t.tbodyNode.getBoundingClientRect(), r = io(t.domNode, this.pmView);
      if (!r)
        return;
      this.tableElement = r.node;
      let s;
      const i = this.editor.transact(
        (b) => F(r.id, b.doc)
      );
      if (!i)
        throw new Error(`Block with ID ${r.id} not found`);
      const a = E(
        i.node,
        this.editor.pmSchema,
        this.editor.schema.blockSchema,
        this.editor.schema.inlineContentSchema,
        this.editor.schema.styleSchema
      );
      if (ii("table", a, this.editor) && (this.tablePos = i.posBeforeNode + 1, s = a), !s)
        return;
      this.tableId = r.id;
      const c = (h = t.domNode.closest(".tableWrapper")) == null ? void 0 : h.querySelector(".table-widgets-container");
      if ((t == null ? void 0 : t.type) === "wrapper") {
        const b = n.clientY >= o.bottom - 1 && // -1 to account for fractions of pixels in "bottom"
        n.clientY < o.bottom + 20, k = n.clientX >= o.right - 1 && n.clientX < o.right + 20, w = n.clientX > o.right || n.clientY > o.bottom;
        this.state = {
          ...this.state,
          show: !0,
          showAddOrRemoveRowsButton: b,
          showAddOrRemoveColumnsButton: k,
          referencePosTable: o,
          block: s,
          widgetContainer: c,
          colIndex: w || (f = this.state) == null ? void 0 : f.colIndex,
          rowIndex: w || (m = this.state) == null ? void 0 : m.rowIndex,
          referencePosCell: w || (g = this.state) == null ? void 0 : g.referencePosCell
        };
      } else {
        const b = Oe(t.domNode), k = Oe(t.domNode.parentElement), w = t.domNode.getBoundingClientRect();
        if (this.state !== void 0 && this.state.show && this.tableId === r.id && this.state.rowIndex === k && this.state.colIndex === b)
          return;
        this.state = {
          show: !0,
          showAddOrRemoveColumnsButton: b === s.content.rows[0].cells.length - 1,
          showAddOrRemoveRowsButton: k === s.content.rows.length - 1,
          referencePosTable: o,
          block: s,
          draggingState: void 0,
          referencePosCell: w,
          colIndex: b,
          rowIndex: k,
          widgetContainer: c
        };
      }
      return this.emitUpdate(), !1;
    });
    p(this, "dragOverHandler", (n) => {
      var h;
      if (((h = this.state) == null ? void 0 : h.draggingState) === void 0)
        return;
      n.preventDefault(), n.dataTransfer.dropEffect = "move", Qa(
        ".prosemirror-dropcursor-block, .prosemirror-dropcursor-inline",
        this.pmView.root
      );
      const t = {
        left: Math.min(
          Math.max(n.clientX, this.state.referencePosTable.left + 1),
          this.state.referencePosTable.right - 1
        ),
        top: Math.min(
          Math.max(n.clientY, this.state.referencePosTable.top + 1),
          this.state.referencePosTable.bottom - 1
        )
      }, o = this.pmView.root.elementsFromPoint(t.left, t.top).filter(
        (f) => f.tagName === "TD" || f.tagName === "TH"
      );
      if (o.length === 0)
        return;
      const r = o[0];
      let s = !1;
      const i = Oe(r.parentElement), a = Oe(r), c = this.state.draggingState.draggedCellOrientation === "row" ? this.state.rowIndex : this.state.colIndex, d = (this.state.draggingState.draggedCellOrientation === "row" ? i : a) !== c;
      (this.state.rowIndex !== i || this.state.colIndex !== a) && (this.state.rowIndex = i, this.state.colIndex = a, this.state.referencePosCell = r.getBoundingClientRect(), s = !0);
      const u = this.state.draggingState.draggedCellOrientation === "row" ? t.top : t.left;
      this.state.draggingState.mousePos !== u && (this.state.draggingState.mousePos = u, s = !0), s && this.emitUpdate(), d && this.editor.transact((f) => f.setMeta(Ce, !0));
    });
    p(this, "dropHandler", (n) => {
      if (this.mouseState = "up", this.state === void 0 || this.state.draggingState === void 0)
        return !1;
      if (this.state.rowIndex === void 0 || this.state.colIndex === void 0)
        throw new Error(
          "Attempted to drop table row or column, but no table block was hovered prior."
        );
      n.preventDefault();
      const { draggingState: t, colIndex: o, rowIndex: r } = this.state, s = this.state.block.content.columnWidths;
      if (t.draggedCellOrientation === "row") {
        if (!En(
          this.state.block,
          t.originalIndex,
          r
        ))
          return !1;
        const i = Br(
          this.state.block,
          t.originalIndex,
          r
        );
        this.editor.updateBlock(this.state.block, {
          type: "table",
          content: {
            ...this.state.block.content,
            rows: i
          }
        });
      } else {
        if (!Bn(
          this.state.block,
          t.originalIndex,
          o
        ))
          return !1;
        const i = Er(
          this.state.block,
          t.originalIndex,
          o
        ), [a] = s.splice(t.originalIndex, 1);
        s.splice(o, 0, a), this.editor.updateBlock(this.state.block, {
          type: "table",
          content: {
            ...this.state.block.content,
            columnWidths: s,
            rows: i
          }
        });
      }
      return this.editor.setTextCursorPosition(this.state.block.id), !0;
    });
    this.editor = n, this.pmView = t, this.emitUpdate = () => {
      if (!this.state)
        throw new Error("Attempting to update uninitialized image toolbar");
      o(this.state);
    }, t.dom.addEventListener("mousemove", this.mouseMoveHandler), t.dom.addEventListener("mousedown", this.viewMousedownHandler), window.addEventListener("mouseup", this.mouseUpHandler), t.root.addEventListener(
      "dragover",
      this.dragOverHandler
    ), t.root.addEventListener(
      "drop",
      this.dropHandler
    );
  }
  // Updates drag handles when the table is modified or removed.
  update() {
    var r;
    if (!this.state || !this.state.show)
      return;
    if (this.state.block = this.editor.getBlock(this.state.block.id), !this.state.block || this.state.block.type !== "table" || // when collaborating, the table element might be replaced and out of date
    // because yjs replaces the element when for example you change the color via the side menu
    !((r = this.tableElement) != null && r.isConnected)) {
      this.state.show = !1, this.state.showAddOrRemoveRowsButton = !1, this.state.showAddOrRemoveColumnsButton = !1, this.emitUpdate();
      return;
    }
    const { height: n, width: t } = Et(
      this.state.block
    );
    this.state.rowIndex !== void 0 && this.state.colIndex !== void 0 && (this.state.rowIndex >= n && (this.state.rowIndex = n - 1), this.state.colIndex >= t && (this.state.colIndex = t - 1));
    const o = this.tableElement.querySelector("tbody");
    if (!o)
      throw new Error(
        "Table block does not contain a 'tbody' HTML element. This should never happen."
      );
    if (this.state.rowIndex !== void 0 && this.state.colIndex !== void 0) {
      const i = o.children[this.state.rowIndex].children[this.state.colIndex];
      i ? this.state.referencePosCell = i.getBoundingClientRect() : (this.state.rowIndex = void 0, this.state.colIndex = void 0);
    }
    this.state.referencePosTable = o.getBoundingClientRect(), this.emitUpdate();
  }
  destroy() {
    this.pmView.dom.removeEventListener("mousemove", this.mouseMoveHandler), window.removeEventListener("mouseup", this.mouseUpHandler), this.pmView.dom.removeEventListener("mousedown", this.viewMousedownHandler), this.pmView.root.removeEventListener(
      "dragover",
      this.dragOverHandler
    ), this.pmView.root.removeEventListener(
      "drop",
      this.dropHandler
    );
  }
}
const Ce = new V("TableHandlesPlugin");
class tc extends L {
  constructor(t) {
    super();
    p(this, "view");
    /**
     * Callback that should be set on the `dragStart` event for whichever element
     * is used as the column drag handle.
     */
    p(this, "colDragStart", (t) => {
      if (this.view.state === void 0 || this.view.state.colIndex === void 0)
        throw new Error(
          "Attempted to drag table column, but no table block was hovered prior."
        );
      if (this.view.state.draggingState = {
        draggedCellOrientation: "col",
        originalIndex: this.view.state.colIndex,
        mousePos: t.clientX
      }, this.view.emitUpdate(), this.editor.transact(
        (o) => o.setMeta(Ce, {
          draggedCellOrientation: this.view.state.draggingState.draggedCellOrientation,
          originalIndex: this.view.state.colIndex,
          newIndex: this.view.state.colIndex,
          tablePos: this.view.tablePos
        })
      ), !this.editor.prosemirrorView)
        throw new Error("Editor view not initialized.");
      an(this.editor.prosemirrorView.root), t.dataTransfer.setDragImage(_, 0, 0), t.dataTransfer.effectAllowed = "move";
    });
    /**
     * Callback that should be set on the `dragStart` event for whichever element
     * is used as the row drag handle.
     */
    p(this, "rowDragStart", (t) => {
      if (this.view.state === void 0 || this.view.state.rowIndex === void 0)
        throw new Error(
          "Attempted to drag table row, but no table block was hovered prior."
        );
      if (this.view.state.draggingState = {
        draggedCellOrientation: "row",
        originalIndex: this.view.state.rowIndex,
        mousePos: t.clientY
      }, this.view.emitUpdate(), this.editor.transact(
        (o) => o.setMeta(Ce, {
          draggedCellOrientation: this.view.state.draggingState.draggedCellOrientation,
          originalIndex: this.view.state.rowIndex,
          newIndex: this.view.state.rowIndex,
          tablePos: this.view.tablePos
        })
      ), !this.editor.prosemirrorView)
        throw new Error("Editor view not initialized.");
      an(this.editor.prosemirrorView.root), t.dataTransfer.setDragImage(_, 0, 0), t.dataTransfer.effectAllowed = "copyMove";
    });
    /**
     * Callback that should be set on the `dragEnd` event for both the element
     * used as the row drag handle, and the one used as the column drag handle.
     */
    p(this, "dragEnd", () => {
      if (this.view.state === void 0)
        throw new Error(
          "Attempted to drag table row, but no table block was hovered prior."
        );
      if (this.view.state.draggingState = void 0, this.view.emitUpdate(), this.editor.transact((t) => t.setMeta(Ce, null)), !this.editor.prosemirrorView)
        throw new Error("Editor view not initialized.");
      Xa(this.editor.prosemirrorView.root);
    });
    /**
     * Freezes the drag handles. When frozen, they will stay attached to the same
     * cell regardless of which cell is hovered by the mouse cursor.
     */
    p(this, "freezeHandles", () => {
      this.view.menuFrozen = !0;
    });
    /**
     * Unfreezes the drag handles. When frozen, they will stay attached to the
     * same cell regardless of which cell is hovered by the mouse cursor.
     */
    p(this, "unfreezeHandles", () => {
      this.view.menuFrozen = !1;
    });
    p(this, "getCellsAtRowHandle", (t, o) => lt(t, o));
    /**
     * Get all the cells in a column of the table block.
     */
    p(this, "getCellsAtColumnHandle", (t, o) => dt(t, o));
    /**
     * Sets the selection to the given cell or a range of cells.
     * @returns The new state after the selection has been set.
     */
    p(this, "setCellSelection", (t, o, r = o) => {
      const s = this.view;
      if (!s)
        throw new Error("Table handles view not initialized");
      const i = t.doc.resolve(s.tablePos + 1), a = t.doc.resolve(
        i.posAtIndex(o.row) + 1
      ), c = t.doc.resolve(
        // No need for +1, since CellSelection expects the position before the cell
        a.posAtIndex(o.col)
      ), l = t.doc.resolve(
        i.posAtIndex(r.row) + 1
      ), d = t.doc.resolve(
        // No need for +1, since CellSelection expects the position before the cell
        l.posAtIndex(r.col)
      ), u = t.tr;
      return u.setSelection(
        new xe(c, d)
      ), t.apply(u);
    });
    /**
     * Adds a row or column to the table using prosemirror-table commands
     */
    p(this, "addRowOrColumn", (t, o) => {
      this.editor.exec((r, s) => {
        const i = this.setCellSelection(
          r,
          o.orientation === "row" ? { row: t, col: 0 } : { row: 0, col: t }
        );
        return o.orientation === "row" ? o.side === "above" ? Oo(i, s) : Ro(i, s) : o.side === "left" ? Vo(i, s) : _o(i, s);
      });
    });
    /**
     * Removes a row or column from the table using prosemirror-table commands
     */
    p(this, "removeRowOrColumn", (t, o) => o === "row" ? this.editor.exec((r, s) => {
      const i = this.setCellSelection(r, {
        row: t,
        col: 0
      });
      return Uo(i, s);
    }) : this.editor.exec((r, s) => {
      const i = this.setCellSelection(r, {
        row: 0,
        col: t
      });
      return $o(i, s);
    }));
    /**
     * Merges the cells in the table block.
     */
    p(this, "mergeCells", (t) => this.editor.exec((o, r) => {
      const s = t ? this.setCellSelection(
        o,
        t.relativeStartCell,
        t.relativeEndCell
      ) : o;
      return Fo(s, r);
    }));
    /**
     * Splits the cell in the table block.
     * If no cell is provided, the current cell selected will be split.
     */
    p(this, "splitCell", (t) => this.editor.exec((o, r) => {
      const s = t ? this.setCellSelection(o, t) : o;
      return zo(s, r);
    }));
    /**
     * Gets the start and end cells of the current cell selection.
     * @returns The start and end cells of the current cell selection.
     */
    p(this, "getCellSelection", () => this.editor.transact((t) => {
      const o = t.selection;
      let r = o.$from, s = o.$to;
      if (Yt(o)) {
        const { ranges: m } = o;
        m.forEach((g) => {
          r = g.$from.min(r ?? g.$from), s = g.$to.max(s ?? g.$to);
        });
      } else if (r = t.doc.resolve(
        o.$from.pos - o.$from.parentOffset - 1
      ), s = t.doc.resolve(
        o.$to.pos - o.$to.parentOffset - 1
      ), r.pos === 0 || s.pos === 0)
        return;
      const i = t.doc.resolve(
        r.pos - r.parentOffset - 1
      ), a = t.doc.resolve(s.pos - s.parentOffset - 1), c = t.doc.resolve(i.pos - i.parentOffset - 1), l = r.index(i.depth), d = i.index(c.depth), u = s.index(a.depth), h = a.index(c.depth), f = [];
      for (let m = d; m <= h; m++)
        for (let g = l; g <= u; g++)
          f.push({ row: m, col: g });
      return {
        from: {
          row: d,
          col: l
        },
        to: {
          row: h,
          col: u
        },
        cells: f
      };
    }));
    /**
     * Gets the direction of the merge based on the current cell selection.
     *
     * Returns undefined when there is no cell selection, or the selection is not within a table.
     */
    p(this, "getMergeDirection", (t) => this.editor.transact((o) => {
      const r = Yt(o.selection) ? o.selection : void 0;
      if (!r || !t || // Only offer the merge button if there is more than one cell selected.
      r.ranges.length <= 1)
        return;
      const s = this.getCellSelection();
      if (s)
        return Tr(s.from, s.to, t) ? "vertical" : "horizontal";
    }));
    p(this, "cropEmptyRowsOrColumns", (t, o) => xr(t, o));
    p(this, "addRowsOrColumns", (t, o, r) => Mr(t, o, r));
    this.editor = t, this.addProsemirrorPlugin(
      new I({
        key: Ce,
        view: (o) => (this.view = new ec(t, o, (r) => {
          this.emit("update", r);
        }), this.view),
        // We use decorations to render the drop cursor when dragging a table row
        // or column. The decorations are updated in the `dragOverHandler` method.
        props: {
          decorations: (o) => {
            if (this.view === void 0 || this.view.state === void 0 || this.view.state.draggingState === void 0 || this.view.tablePos === void 0)
              return;
            const r = this.view.state.draggingState.draggedCellOrientation === "row" ? this.view.state.rowIndex : this.view.state.colIndex;
            if (r === void 0)
              return;
            const s = [], { block: i, draggingState: a } = this.view.state, { originalIndex: c, draggedCellOrientation: l } = a;
            if (r === c || !i || l === "row" && !En(i, c, r) || l === "col" && !Bn(i, c, r))
              return q.create(o.doc, s);
            const d = o.doc.resolve(this.view.tablePos + 1);
            return this.view.state.draggingState.draggedCellOrientation === "row" ? lt(
              this.view.state.block,
              r
            ).forEach(({ row: h, col: f }) => {
              const m = o.doc.resolve(
                d.posAtIndex(h) + 1
              ), g = o.doc.resolve(
                m.posAtIndex(f) + 1
              ), b = g.node(), k = g.pos + (r > c ? b.nodeSize - 2 : 0);
              s.push(
                // The widget is a small bar which spans the width of the cell.
                Q.widget(k, () => {
                  const w = document.createElement("div");
                  return w.className = "bn-table-drop-cursor", w.style.left = "0", w.style.right = "0", r > c ? w.style.bottom = "-2px" : w.style.top = "-3px", w.style.height = "4px", w;
                })
              );
            }) : dt(
              this.view.state.block,
              r
            ).forEach(({ row: h, col: f }) => {
              const m = o.doc.resolve(
                d.posAtIndex(h) + 1
              ), g = o.doc.resolve(
                m.posAtIndex(f) + 1
              ), b = g.node(), k = g.pos + (r > c ? b.nodeSize - 2 : 0);
              s.push(
                // The widget is a small bar which spans the height of the cell.
                Q.widget(k, () => {
                  const w = document.createElement("div");
                  return w.className = "bn-table-drop-cursor", w.style.top = "0", w.style.bottom = "0", r > c ? w.style.right = "-2px" : w.style.left = "-3px", w.style.width = "4px", w;
                })
              );
            }), q.create(o.doc, s);
          }
        }
      })
    );
  }
  static key() {
    return "tableHandles";
  }
  onUpdate(t) {
    return this.on("update", t);
  }
}
const nc = U.create({
  name: "textAlignment",
  addGlobalAttributes() {
    return [
      {
        // Attribute is applied to block content instead of container so that child blocks don't inherit the text
        // alignment styling.
        types: [
          "paragraph",
          "heading",
          "bulletListItem",
          "numberedListItem",
          "customListItem",
          "checkListItem",
          "tableCell",
          "tableHeader"
        ],
        attributes: {
          textAlignment: {
            default: "left",
            parseHTML: (e) => e.getAttribute("data-text-alignment"),
            renderHTML: (e) => e.textAlignment === "left" ? {} : {
              "data-text-alignment": e.textAlignment
            }
          }
        }
      }
    ];
  }
}), oc = U.create({
  name: "blockTextColor",
  addGlobalAttributes() {
    return [
      {
        types: ["blockContainer", "tableCell", "tableHeader"],
        attributes: {
          textColor: {
            default: M.textColor.default,
            parseHTML: (e) => e.hasAttribute("data-text-color") ? e.getAttribute("data-text-color") : M.textColor.default,
            renderHTML: (e) => e.textColor === M.textColor.default ? {} : {
              "data-text-color": e.textColor
            }
          }
        }
      }
    ];
  }
}), rc = U.create({
  name: "trailingNode",
  addProseMirrorPlugins() {
    const e = new V(this.name);
    return [
      new I({
        key: e,
        appendTransaction: (n, t, o) => {
          const { doc: r, tr: s, schema: i } = o, a = e.getState(o), c = r.content.size - 2, l = i.nodes.blockContainer, d = i.nodes.paragraph;
          if (a)
            return s.insert(
              c,
              l.create(void 0, d.create())
            );
        },
        state: {
          init: (n, t) => {
          },
          apply: (n, t) => {
            if (!n.docChanged)
              return t;
            let o = n.doc.lastChild;
            if (!o || o.type.name !== "blockGroup")
              throw new Error("Expected blockGroup");
            if (o = o.lastChild, !o || o.type.name !== "blockContainer")
              return !0;
            const r = o.firstChild;
            if (!r)
              throw new Error("Expected blockContent");
            return o.nodeSize > 4 || r.type.spec.content !== "inline*";
          }
        }
      })
    ];
  }
}), sc = {
  blockColor: "data-block-color",
  blockStyle: "data-block-style",
  id: "data-id",
  depth: "data-depth",
  depthChange: "data-depth-change"
}, ic = oe.create({
  name: "blockContainer",
  group: "blockGroupChild bnBlock",
  // A block always contains content, and optionally a blockGroup which contains nested blocks
  content: "blockContent blockGroup?",
  // Ensures content-specific keyboard handlers trigger first.
  priority: 50,
  defining: !0,
  marks: "insertion modification deletion",
  parseHTML() {
    return [
      {
        tag: "div[data-node-type=" + this.name + "]",
        getAttrs: (e) => {
          if (typeof e == "string")
            return !1;
          const n = {};
          for (const [t, o] of Object.entries(sc))
            e.getAttribute(o) && (n[t] = e.getAttribute(o));
          return n;
        }
      },
      // Ignore `blockOuter` divs, but parse the `blockContainer` divs inside them.
      {
        tag: 'div[data-node-type="blockOuter"]',
        skip: !0
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    var r;
    const n = document.createElement("div");
    n.className = "bn-block-outer", n.setAttribute("data-node-type", "blockOuter");
    for (const [s, i] of Object.entries(e))
      s !== "class" && n.setAttribute(s, i);
    const t = {
      ...((r = this.options.domAttributes) == null ? void 0 : r.block) || {},
      ...e
    }, o = document.createElement("div");
    o.className = ne("bn-block", t.class), o.setAttribute("data-node-type", this.name);
    for (const [s, i] of Object.entries(t))
      s !== "class" && o.setAttribute(s, i);
    return n.appendChild(o), {
      dom: n,
      contentDOM: o
    };
  }
}), ac = oe.create({
  name: "blockGroup",
  group: "childContainer",
  content: "blockGroupChild+",
  marks: "deletion insertion modification",
  parseHTML() {
    return [
      {
        tag: "div",
        getAttrs: (e) => typeof e == "string" ? !1 : e.getAttribute("data-node-type") === "blockGroup" ? null : !1
      }
    ];
  },
  renderHTML({ HTMLAttributes: e }) {
    var o;
    const n = {
      ...((o = this.options.domAttributes) == null ? void 0 : o.blockGroup) || {},
      ...e
    }, t = document.createElement("div");
    t.className = ne(
      "bn-block-group",
      n.class
    ), t.setAttribute("data-node-type", "blockGroup");
    for (const [r, s] of Object.entries(n))
      r !== "class" && t.setAttribute(r, s);
    return {
      dom: t,
      contentDOM: t
    };
  }
}), cc = oe.create({
  name: "doc",
  topNode: !0,
  content: "blockGroup",
  marks: "insertion modification deletion"
});
class lc extends L {
  constructor({
    editor: t,
    collaboration: o
  }) {
    super(t);
    p(this, "editor");
    p(this, "collaboration");
    /**
     * Stores whether the editor is editing a forked document,
     * preserving a reference to the original document and the forked document.
     */
    p(this, "forkedState");
    this.editor = t, this.collaboration = o;
  }
  static key() {
    return "ForkYDocPlugin";
  }
  /**
   * To find a fragment in another ydoc, we need to search for it.
   */
  findTypeInOtherYdoc(t, o) {
    const r = t.doc;
    if (t._item === null) {
      const s = Array.from(r.share.keys()).find(
        (i) => r.share.get(i) === t
      );
      if (s == null)
        throw new Error("type does not exist in other ydoc");
      return o.get(s, t.constructor);
    } else {
      const s = t._item, i = o.store.clients.get(s.id.client) ?? [], a = ie.findIndexSS(i, s.id.clock);
      return i[a].content.type;
    }
  }
  /**
   * Whether the editor is editing a forked document,
   * preserving a reference to the original document and the forked document.
   */
  get isForkedFromRemote() {
    return this.forkedState !== void 0;
  }
  /**
   * Fork the Y.js document from syncing to the remote,
   * allowing modifications to the document without affecting the remote.
   * These changes can later be rolled back or applied to the remote.
   */
  fork() {
    var s;
    if (this.isForkedFromRemote)
      return;
    const t = (s = this.collaboration) == null ? void 0 : s.fragment;
    if (!t)
      throw new Error("No fragment to fork from");
    const o = new ie.Doc();
    ie.applyUpdate(o, ie.encodeStateAsUpdate(t.doc));
    const r = this.findTypeInOtherYdoc(t, o);
    this.forkedState = {
      undoStack: Ae.getState(this.editor.prosemirrorState).undoManager.undoStack,
      originalFragment: t,
      forkedFragment: r
    }, this.editor._tiptapEditor.unregisterPlugin([
      tr,
      Ae,
      de
    ]), this.editor._tiptapEditor.registerPlugin(
      new ft(r).plugins[0]
    ), this.editor._tiptapEditor.registerPlugin(
      new mt({ editor: this.editor }).plugins[0]
    ), this.emit("forked", !0);
  }
  /**
   * Resume syncing the Y.js document to the remote
   * If `keepChanges` is true, any changes that have been made to the forked document will be applied to the original document.
   * Otherwise, the original document will be restored and the changes will be discarded.
   */
  merge({ keepChanges: t }) {
    if (!this.forkedState)
      return;
    this.editor._tiptapEditor.unregisterPlugin(de), this.editor._tiptapEditor.unregisterPlugin(Ae);
    const { originalFragment: o, forkedFragment: r, undoStack: s } = this.forkedState;
    if (this.editor.extensions.ySyncPlugin = new ft(o), this.editor.extensions.yCursorPlugin = new Fe(
      this.collaboration
    ), this.editor.extensions.yUndoPlugin = new mt({
      editor: this.editor
    }), this.editor._tiptapEditor.registerPlugin(
      this.editor.extensions.ySyncPlugin.plugins[0]
    ), this.editor._tiptapEditor.registerPlugin(
      this.editor.extensions.yCursorPlugin.plugins[0]
    ), this.editor._tiptapEditor.registerPlugin(
      this.editor.extensions.yUndoPlugin.plugins[0]
    ), Ae.getState(
      this.editor.prosemirrorState
    ).undoManager.undoStack = s, t) {
      const i = ie.encodeStateAsUpdate(
        r.doc,
        ie.encodeStateVector(o.doc)
      );
      ie.applyUpdate(o.doc, i, this.editor);
    }
    this.forkedState = void 0, this.emit("forked", !1);
  }
}
const dc = (e) => {
  var r;
  const n = {}, t = uc(e);
  for (const s of t)
    n[s.name] = s;
  e.collaboration && (n.ySyncPlugin = new ft(e.collaboration.fragment), n.yUndoPlugin = new mt({ editor: e.editor }), (r = e.collaboration.provider) != null && r.awareness && (n.yCursorPlugin = new Fe(e.collaboration)), n.forkYDocPlugin = new lc({
    editor: e.editor,
    collaboration: e.collaboration
  })), n.formattingToolbar = new ya(
    e.editor
  ), n.linkToolbar = new Ma(e.editor), n.sideMenu = new Fa(e.editor), n.suggestionMenus = new qa(e.editor), n.filePanel = new ba(e.editor), n.placeholder = new Na(e.editor, e.placeholders), (e.animations ?? !0) && (n.animations = new Da()), e.tableHandles && (n.tableHandles = new tc(e.editor)), n.nodeSelectionKeyboard = new La(), n.blockChange = new ua(), n.showSelection = new Oa(e.editor), e.comments && (n.comments = new ma(
    e.editor,
    e.comments.threadStore,
    ro.name
  ));
  const o = e.disableExtensions || [];
  for (const s of o)
    delete n[s];
  return n;
};
let cn = !1;
const uc = (e) => {
  const n = [
    ye.ClipboardTextSerializer,
    ye.Commands,
    ye.Editable,
    ye.FocusEvents,
    ye.Tabindex,
    // DevTools,
    Wo,
    // DropCursor,
    U.create({
      name: "dropCursor",
      addProseMirrorPlugins: () => [
        e.dropCursor({
          width: 5,
          color: "#ddeeff",
          editor: e.editor
        })
      ]
    }),
    je.configure({
      // everything from bnBlock group (nodes that represent a BlockNote block should have an id)
      types: ["blockContainer", "columnList", "column"],
      setIdAttribute: e.setIdAttribute
    }),
    Ca,
    // Comments,
    // basics:
    qo,
    // marks:
    Ka,
    Ya,
    Ja,
    Go.extend({
      inclusive: !1
    }).configure({
      defaultProtocol: Pa,
      // only call this once if we have multiple editors installed. Or fix https://github.com/ueberdosis/tiptap/issues/5450
      protocols: cn ? [] : Ta
    }),
    ...Object.values(e.styleSpecs).map((t) => t.implementation.mark.configure({
      editor: e.editor
    })),
    oc,
    da,
    nc,
    // make sure escape blurs editor, so that we can tab to other elements in the host page (accessibility)
    U.create({
      name: "OverrideEscape",
      addKeyboardShortcuts() {
        return {
          Escape: () => e.editor.suggestionMenus.shown ? !1 : this.editor.commands.blur()
        };
      }
    }),
    // nodes
    cc,
    ic.configure({
      editor: e.editor,
      domAttributes: e.domAttributes
    }),
    Ea.configure({
      editor: e.editor,
      tabBehavior: e.tabBehavior
    }),
    ac.configure({
      domAttributes: e.domAttributes
    }),
    ...Object.values(e.inlineContentSpecs).filter((t) => t.config !== "link" && t.config !== "text").map((t) => t.implementation.node.configure({
      editor: e.editor
    })),
    ...Object.values(e.blockSpecs).flatMap((t) => [
      // dependent nodes (e.g.: tablecell / row)
      ...(t.implementation.requiredExtensions || []).map(
        (o) => o.configure({
          editor: e.editor,
          domAttributes: e.domAttributes
        })
      ),
      // the actual node itself
      t.implementation.node.configure({
        editor: e.editor,
        domAttributes: e.domAttributes
      })
    ]),
    la(e.editor),
    aa(
      e.editor,
      e.pasteHandler || ((t) => t.defaultPasteHandler())
    ),
    Wi(e.editor),
    // This needs to be at the bottom of this list, because Key events (such as enter, when selecting a /command),
    // should be handled before Enter handlers in other components like splitListItem
    ...e.trailingBlock === void 0 || e.trailingBlock ? [rc] : [],
    ...e.comments ? [ro] : []
  ];
  return cn = !0, e.collaboration || n.push(jo), n;
};
function pc(e, n) {
  const t = [];
  return e.forEach((o, r, s) => {
    s !== n && t.push(o);
  }), R.from(t);
}
function hc(e, n) {
  const t = [];
  for (let o = 0; o < e.childCount; o++)
    if (e.child(o).type.name === "tableRow")
      if (t.length > 0 && t[t.length - 1].type.name === "table") {
        const r = t[t.length - 1], s = r.copy(r.content.addToEnd(e.child(o)));
        t[t.length - 1] = s;
      } else {
        const r = n.nodes.table.createChecked(
          void 0,
          e.child(o)
        );
        t.push(r);
      }
    else
      t.push(e.child(o));
  return e = R.from(t), e;
}
function fc(e, n) {
  let t = R.from(e.content);
  if (t = hc(t, n.state.schema), !mc(t, n))
    return new Z(t, e.openStart, e.openEnd);
  for (let o = 0; o < t.childCount; o++)
    if (t.child(o).type.spec.group === "blockContent") {
      const r = [t.child(o)];
      if (o + 1 < t.childCount && t.child(o + 1).type.name === "blockGroup") {
        const i = t.child(o + 1).child(0).child(0);
        (i.type.name === "bulletListItem" || i.type.name === "numberedListItem" || i.type.name === "customListItem" || i.type.name === "checkListItem") && (r.push(t.child(o + 1)), t = pc(t, o + 1));
      }
      const s = n.state.schema.nodes.blockContainer.createChecked(
        void 0,
        r
      );
      t = t.replaceChild(o, s);
    }
  return new Z(t, e.openStart, e.openEnd);
}
function mc(e, n) {
  var s, i;
  const t = e.childCount === 1, o = ((s = e.firstChild) == null ? void 0 : s.type.spec.content) === "inline*", r = ((i = e.firstChild) == null ? void 0 : i.type.spec.content) === "tableRow+";
  if (t) {
    if (o)
      return !1;
    if (r) {
      const a = C(n.state);
      if (a.isBlockContainer)
        return !(a.blockContent.node.type.spec.content === "tableRow+");
    }
  }
  return !0;
}
const We = class We extends yo {
  constructor(t, o) {
    super({ ...t, content: void 0 });
    p(this, "_state");
    /**
     * Mounts / unmounts the editor to a dom element
     *
     * @param element DOM element to mount to, ur null / undefined to destroy
     */
    p(this, "mount", (t, o, r) => {
      o ? (this.options.element = o, this.createViewAlternative(t, r)) : (this.destroy(), this.isInitialized = !1);
    });
    const r = this.schema;
    let s;
    const i = r.nodes.doc.createAndFill;
    r.nodes.doc.createAndFill = (...c) => {
      if (s)
        return s;
      const l = i.apply(r.nodes.doc, c), d = JSON.parse(JSON.stringify(l.toJSON()));
      return d.content[0].content[0].attrs.id = "initialBlockId", s = po.fromJSON(r, d), s;
    };
    let a;
    try {
      const c = t == null ? void 0 : t.content.map(
        (l) => he(l, this.schema, o).toJSON()
      );
      a = Co(
        {
          type: "doc",
          content: [
            {
              type: "blockGroup",
              content: c
            }
          ]
        },
        this.schema,
        this.options.parseOptions
      );
    } catch (c) {
      throw console.error(
        "Error creating document from blocks passed as `initialContent`. Caused by exception: ",
        c
      ), new Error(
        "Error creating document from blocks passed as `initialContent`:\n" + +JSON.stringify(t.content)
      );
    }
    this._state = So.create({
      doc: a,
      schema: this.schema
      // selection: selection || undefined,
    });
  }
  get state() {
    return this.view && (this._state = this.view.state), this._state;
  }
  dispatch(t) {
    if (!this.view) {
      this._state = this.state.apply(t), this.emit("transaction", {
        editor: this,
        transaction: t
      });
      return;
    }
    if (this.view.isDestroyed)
      return;
    if (this.isCapturingTransaction) {
      this.dispatchTransaction(t);
      return;
    }
    const { state: o, transactions: r } = this.state.applyTransaction(t), s = !this.state.selection.eq(o.selection);
    this.emit("beforeTransaction", {
      editor: this,
      transaction: t,
      nextState: o
    }), this.view.updateState(o), this.emit("transaction", {
      editor: this,
      transaction: t
    }), s && this.emit("selectionUpdate", {
      editor: this,
      transaction: t
    });
    const i = t.getMeta("focus"), a = t.getMeta("blur");
    i && this.emit("focus", {
      editor: this,
      event: i.event,
      transaction: t
    }), a && this.emit("blur", {
      editor: this,
      event: a.event,
      transaction: t
    }), !(!t.docChanged || t.getMeta("preventUpdate")) && (this.emit("update", {
      editor: this,
      transaction: t
    }), this.emit("v3-update", {
      editor: this,
      transaction: t,
      appendedTransactions: r.slice(1)
    }));
  }
  // a helper method that can enable plugins before the view has been initialized
  // currently only used for testing
  forceEnablePlugins() {
    if (this.view)
      throw new Error(
        "forcePluginsEnabled called after view has been initialized"
      );
    this._state = this.state.reconfigure({
      plugins: this.extensionManager.plugins
    });
  }
  /**
   * Replace the default `createView` method with a custom one - which we call on mount
   */
  createViewAlternative(t, o) {
    this.contentComponent = o;
    const r = {};
    this.extensionManager.extensions.forEach((i) => {
      i.type === "mark" && i.config.addMarkView && (r[i.name] = i.config.addMarkView(t));
    }), this.view = new rr(
      { mount: this.options.element },
      // use mount option so that we reuse the existing element instead of creating a new one
      {
        ...this.options.editorProps,
        // @ts-ignore
        dispatchTransaction: this.dispatch.bind(this),
        state: this.state,
        markViews: r,
        nodeViews: this.extensionManager.nodeViews
      }
    );
    const s = this.state.reconfigure({
      plugins: this.extensionManager.plugins
    });
    this.view.updateState(s), this.commands.focus(
      this.options.autofocus || this.options.element.getAttribute("data-bn-autofocus") === "true",
      { scrollIntoView: !1 }
    ), this.emit("create", { editor: this }), this.isInitialized = !0;
  }
};
p(We, "create", (t, o) => {
  var s, i;
  const r = (s = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : s.setTimeout;
  typeof ((i = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : i.setTimeout) < "u" && (globalThis.window.setTimeout = () => 0);
  try {
    return new We(t, o);
  } finally {
    r && (globalThis.window.setTimeout = r);
  }
});
let ze = We;
ze.prototype.createView = function() {
  this.options.onPaste = this.options.onDrop = void 0;
};
const gc = {
  enableInputRules: !0,
  enablePasteRules: !0,
  enableCoreExtensions: !1
};
class co extends Lt {
  constructor(t) {
    var l, d, u, h, f, m, g, b, k, w, y, v, N, z, B, S;
    super();
    /**
     * The underlying prosemirror schema
     */
    p(this, "pmSchema");
    /**
     * extensions that are added to the editor, can be tiptap extensions or prosemirror plugins
     */
    p(this, "extensions", {});
    /**
     * Boolean indicating whether the editor is in headless mode.
     * Headless mode means we can use features like importing / exporting blocks,
     * but there's no underlying editor (UI) instantiated.
     *
     * You probably don't need to set this manually, but use the `server-util` package instead that uses this option internally
     */
    p(this, "headless", !1);
    p(this, "_tiptapEditor");
    // TODO: Type should actually reflect that it can be `undefined` in headless mode
    /**
     * Used by React to store a reference to an `ElementRenderer` helper utility to make sure we can render React elements
     * in the correct context (used by `ReactRenderUtil`)
     */
    p(this, "elementRenderer", null);
    /**
     * Cache of all blocks. This makes sure we don't have to "recompute" blocks if underlying Prosemirror Nodes haven't changed.
     * This is especially useful when we want to keep track of the same block across multiple operations,
     * with this cache, blocks stay the same object reference (referential equality with ===).
     */
    p(this, "blockCache", /* @__PURE__ */ new WeakMap());
    /**
     * The dictionary contains translations for the editor.
     */
    p(this, "dictionary");
    /**
     * The schema of the editor. The schema defines which Blocks, InlineContent, and Styles are available in the editor.
     */
    p(this, "schema");
    p(this, "blockImplementations");
    p(this, "inlineContentImplementations");
    p(this, "styleImplementations");
    p(this, "formattingToolbar");
    p(this, "linkToolbar");
    p(this, "sideMenu");
    p(this, "suggestionMenus");
    p(this, "filePanel");
    p(this, "tableHandles");
    p(this, "comments");
    p(this, "showSelectionPlugin");
    /**
     * The plugin for forking a document, only defined if in collaboration mode
     */
    p(this, "forkYDocPlugin");
    /**
     * The `uploadFile` method is what the editor uses when files need to be uploaded (for example when selecting an image to upload).
     * This method should set when creating the editor as this is application-specific.
     *
     * `undefined` means the application doesn't support file uploads.
     *
     * @param file The file that should be uploaded.
     * @returns The URL of the uploaded file OR an object containing props that should be set on the file block (such as an id)
     */
    p(this, "uploadFile");
    p(this, "onUploadStartCallbacks", []);
    p(this, "onUploadEndCallbacks", []);
    p(this, "resolveFileUrl");
    p(this, "resolveUsers");
    /**
     * Editor settings
     */
    p(this, "settings");
    /**
     * Stores the currently active transaction, which is the accumulated transaction from all {@link dispatch} calls during a {@link transact} calls
     */
    p(this, "activeTransaction", null);
    /**
     * Mount the editor to a parent DOM element. Call mount(undefined) to clean up
     *
     * @warning Not needed to call manually when using React, use BlockNoteView to take care of mounting
     */
    p(this, "mount", (t, o) => {
      this._tiptapEditor.mount(this, t, o);
    });
    this.options = t;
    const o = t;
    if (o.onEditorContentChange)
      throw new Error(
        "onEditorContentChange initialization option is deprecated, use <BlockNoteView onChange={...} />, the useEditorChange(...) hook, or editor.onChange(...)"
      );
    if (o.onTextCursorPositionChange)
      throw new Error(
        "onTextCursorPositionChange initialization option is deprecated, use <BlockNoteView onSelectionChange={...} />, the useEditorSelectionChange(...) hook, or editor.onSelectionChange(...)"
      );
    if (o.onEditorReady)
      throw new Error(
        "onEditorReady is deprecated. Editor is immediately ready for use after creation."
      );
    if (o.editable)
      throw new Error(
        "editable initialization option is deprecated, use <BlockNoteView editable={true/false} />, or alternatively editor.isEditable = true/false"
      );
    this.dictionary = t.dictionary || cr, this.settings = {
      tables: {
        splitCells: ((l = t == null ? void 0 : t.tables) == null ? void 0 : l.splitCells) ?? !1,
        cellBackgroundColor: ((d = t == null ? void 0 : t.tables) == null ? void 0 : d.cellBackgroundColor) ?? !1,
        cellTextColor: ((u = t == null ? void 0 : t.tables) == null ? void 0 : u.cellTextColor) ?? !1,
        headers: ((h = t == null ? void 0 : t.tables) == null ? void 0 : h.headers) ?? !1
      },
      codeBlock: {
        indentLineWithTab: ((f = t == null ? void 0 : t.codeBlock) == null ? void 0 : f.indentLineWithTab) ?? !0,
        defaultLanguage: ((m = t == null ? void 0 : t.codeBlock) == null ? void 0 : m.defaultLanguage) ?? "text",
        supportedLanguages: ((g = t == null ? void 0 : t.codeBlock) == null ? void 0 : g.supportedLanguages) ?? {},
        createHighlighter: ((b = t == null ? void 0 : t.codeBlock) == null ? void 0 : b.createHighlighter) ?? void 0
      },
      heading: {
        levels: ((k = t == null ? void 0 : t.heading) == null ? void 0 : k.levels) ?? [1, 2, 3]
      }
    };
    const r = {
      defaultStyles: !0,
      schema: t.schema || Ie.create(),
      _headless: !1,
      ...t,
      placeholders: {
        ...this.dictionary.placeholders,
        ...t.placeholders
      }
    };
    if (r.comments && !r.resolveUsers)
      throw new Error("resolveUsers is required when using comments");
    this.resolveUsers = r.resolveUsers, this.schema = r.schema, this.blockImplementations = r.schema.blockSpecs, this.inlineContentImplementations = r.schema.inlineContentSpecs, this.styleImplementations = r.schema.styleSpecs, this.extensions = dc({
      editor: this,
      domAttributes: r.domAttributes || {},
      blockSpecs: this.schema.blockSpecs,
      styleSpecs: this.schema.styleSpecs,
      inlineContentSpecs: this.schema.inlineContentSpecs,
      collaboration: r.collaboration,
      trailingBlock: r.trailingBlock,
      disableExtensions: r.disableExtensions,
      setIdAttribute: r.setIdAttribute,
      animations: r.animations ?? !0,
      tableHandles: D("table", this),
      dropCursor: this.options.dropCursor ?? ar,
      placeholders: r.placeholders,
      tabBehavior: r.tabBehavior,
      comments: r.comments,
      pasteHandler: r.pasteHandler
    }), (((w = r._tiptapOptions) == null ? void 0 : w.extensions) || []).forEach((T) => {
      this.extensions[T.name] = T;
    });
    for (let T of r.extensions || []) {
      typeof T == "function" && (T = T(this));
      const x = T.constructor.key();
      if (!x)
        throw new Error(
          `Extension ${T.constructor.name} does not have a key method`
        );
      if (this.extensions[x])
        throw new Error(
          `Extension ${T.constructor.name} already exists with key ${x}`
        );
      this.extensions[x] = T;
    }
    if (Object.entries(r._extensions || {}).forEach(([T, x]) => {
      const te = typeof x == "function" ? x(this) : x;
      if (!("plugin" in te)) {
        this.extensions[T] = te;
        return;
      }
      this.extensions[T] = new class extends L {
        static key() {
          return T;
        }
        constructor() {
          super(), this.addProsemirrorPlugin(te.plugin);
        }
        get priority() {
          return te.priority;
        }
      }();
    }), this.formattingToolbar = this.extensions.formattingToolbar, this.linkToolbar = this.extensions.linkToolbar, this.sideMenu = this.extensions.sideMenu, this.suggestionMenus = this.extensions.suggestionMenus, this.filePanel = this.extensions.filePanel, this.tableHandles = this.extensions.tableHandles, this.comments = this.extensions.comments, this.showSelectionPlugin = this.extensions.showSelection, this.forkYDocPlugin = this.extensions.forkYDocPlugin, r.uploadFile) {
      const T = r.uploadFile;
      this.uploadFile = async (x, Le) => {
        this.onUploadStartCallbacks.forEach(
          (te) => te.apply(this, [Le])
        );
        try {
          return await T(x, Le);
        } finally {
          this.onUploadEndCallbacks.forEach(
            (te) => te.apply(this, [Le])
          );
        }
      };
    }
    this.resolveFileUrl = r.resolveFileUrl, this.headless = r._headless;
    const s = "ySyncPlugin" in this.extensions || "liveblocksExtension" in this.extensions;
    s && r.initialContent && console.warn(
      "When using Collaboration, initialContent might cause conflicts, because changes should come from the collaboration provider"
    );
    const i = r.initialContent || (s ? [
      {
        type: "paragraph",
        id: "initialBlockId"
      }
    ] : [
      {
        type: "paragraph",
        id: je.options.generateID()
      }
    ]);
    if (!Array.isArray(i) || i.length === 0)
      throw new Error(
        "initialContent must be a non-empty array of blocks, received: " + i
      );
    const a = [
      ...Object.entries(this.extensions).map(([T, x]) => {
        if (x instanceof U || x instanceof oe || x instanceof re)
          return x;
        if (!(x instanceof L && !x.plugins.length))
          return U.create({
            name: T,
            priority: x.priority,
            addProseMirrorPlugins: () => x.plugins
          });
      })
    ].filter((T) => T !== void 0), c = {
      ...gc,
      ...r._tiptapOptions,
      content: i,
      extensions: a,
      editorProps: {
        ...(y = r._tiptapOptions) == null ? void 0 : y.editorProps,
        attributes: {
          // As of TipTap v2.5.0 the tabIndex is removed when the editor is not
          // editable, so you can't focus it. We want to revert this as we have
          // UI behaviour that relies on it.
          tabIndex: "0",
          ...(N = (v = r._tiptapOptions) == null ? void 0 : v.editorProps) == null ? void 0 : N.attributes,
          ...(z = r.domAttributes) == null ? void 0 : z.editor,
          class: ne(
            "bn-editor",
            r.defaultStyles ? "bn-default-styles" : "",
            ((S = (B = r.domAttributes) == null ? void 0 : B.editor) == null ? void 0 : S.class) || ""
          )
        },
        transformPasted: fc
      }
    };
    this.headless ? this.pmSchema = vo(c.extensions) : (this._tiptapEditor = ze.create(
      c,
      this.schema.styleSchema
    ), this.pmSchema = this._tiptapEditor.schema), this.pmSchema.cached.blockNoteEditor = this, this.emit("create");
  }
  static create(t = {}) {
    return new co(t);
  }
  /**
   * Execute a prosemirror command. This is mostly for backwards compatibility with older code.
   *
   * @note You should prefer the {@link transact} method when possible, as it will automatically handle the dispatching of the transaction and work across blocknote transactions.
   *
   * @example
   * ```ts
   * editor.exec((state, dispatch, view) => {
   *   dispatch(state.tr.insertText("Hello, world!"));
   * });
   * ```
   */
  exec(t) {
    if (this.activeTransaction)
      throw new Error(
        "`exec` should not be called within a `transact` call, move the `exec` call outside of the `transact` call"
      );
    const o = this._tiptapEditor.state, r = this._tiptapEditor.view;
    return t(o, (i) => this._tiptapEditor.dispatch(i), r);
  }
  /**
   * Check if a command can be executed. A command should return `false` if it is not valid in the current state.
   *
   * @example
   * ```ts
   * if (editor.canExec(command)) {
   *   // show button
   * } else {
   *   // hide button
   * }
   * ```
   */
  canExec(t) {
    if (this.activeTransaction)
      throw new Error(
        "`canExec` should not be called within a `transact` call, move the `canExec` call outside of the `transact` call"
      );
    const o = this._tiptapEditor.state, r = this._tiptapEditor.view;
    return t(o, void 0, r);
  }
  /**
   * Execute a function within a "blocknote transaction".
   * All changes to the editor within the transaction will be grouped together, so that
   * we can dispatch them as a single operation (thus creating only a single undo step)
   *
   * @note There is no need to dispatch the transaction, as it will be automatically dispatched when the callback is complete.
   *
   * @example
   * ```ts
   * // All changes to the editor will be grouped together
   * editor.transact((tr) => {
   *   tr.insertText("Hello, world!");
   * // These two operations will be grouped together in a single undo step
   *   editor.transact((tr) => {
   *     tr.insertText("Hello, world!");
   *   });
   * });
   * ```
   */
  transact(t) {
    if (this.activeTransaction)
      return t(this.activeTransaction);
    try {
      this.activeTransaction = this._tiptapEditor.state.tr;
      const o = t(this.activeTransaction), r = this.activeTransaction;
      return this.activeTransaction = null, r && // Only dispatch if the transaction was actually modified in some way
      (r.docChanged || r.selectionSet || r.scrolledIntoView || r.storedMarksSet || !r.isGeneric) && this._tiptapEditor.dispatch(r), o;
    } finally {
      this.activeTransaction = null;
    }
  }
  // TO DISCUSS
  /**
   * Shorthand to get a typed extension from the editor, by
   * just passing in the extension class.
   *
   * @param ext - The extension class to get
   * @param key - optional, the key of the extension in the extensions object (defaults to the extension name)
   * @returns The extension instance
   */
  extension(t, o = t.key()) {
    const r = this.extensions[o];
    if (!r)
      throw new Error(`Extension ${o} not found`);
    return r;
  }
  /**
   * Get the underlying prosemirror state
   * @note Prefer using `editor.transact` to read the current editor state, as that will ensure the state is up to date
   * @see https://prosemirror.net/docs/ref/#state.EditorState
   */
  get prosemirrorState() {
    if (this.activeTransaction)
      throw new Error(
        "`prosemirrorState` should not be called within a `transact` call, move the `prosemirrorState` call outside of the `transact` call or use `editor.transact` to read the current editor state"
      );
    return this._tiptapEditor.state;
  }
  /**
   * Get the underlying prosemirror view
   * @see https://prosemirror.net/docs/ref/#view.EditorView
   */
  get prosemirrorView() {
    return this._tiptapEditor.view;
  }
  get domElement() {
    var t;
    return (t = this.prosemirrorView) == null ? void 0 : t.dom;
  }
  isFocused() {
    var t;
    return ((t = this.prosemirrorView) == null ? void 0 : t.hasFocus()) || !1;
  }
  focus() {
    var t;
    (t = this.prosemirrorView) == null || t.focus();
  }
  onUploadStart(t) {
    return this.onUploadStartCallbacks.push(t), () => {
      const o = this.onUploadStartCallbacks.indexOf(t);
      o > -1 && this.onUploadStartCallbacks.splice(o, 1);
    };
  }
  onUploadEnd(t) {
    return this.onUploadEndCallbacks.push(t), () => {
      const o = this.onUploadEndCallbacks.indexOf(t);
      o > -1 && this.onUploadEndCallbacks.splice(o, 1);
    };
  }
  /**
   * @deprecated, use `editor.document` instead
   */
  get topLevelBlocks() {
    return this.document;
  }
  /**
   * Gets a snapshot of all top-level (non-nested) blocks in the editor.
   * @returns A snapshot of all top-level (non-nested) blocks in the editor.
   */
  get document() {
    return this.transact((t) => mr(t.doc, this.pmSchema));
  }
  /**
   * Gets a snapshot of an existing block from the editor.
   * @param blockIdentifier The identifier of an existing block that should be
   * retrieved.
   * @returns The block that matches the identifier, or `undefined` if no
   * matching block was found.
   */
  getBlock(t) {
    return this.transact((o) => Si(o.doc, t));
  }
  /**
   * Gets a snapshot of the previous sibling of an existing block from the
   * editor.
   * @param blockIdentifier The identifier of an existing block for which the
   * previous sibling should be retrieved.
   * @returns The previous sibling of the block that matches the identifier.
   * `undefined` if no matching block was found, or it's the first child/block
   * in the document.
   */
  getPrevBlock(t) {
    return this.transact((o) => Ei(o.doc, t));
  }
  /**
   * Gets a snapshot of the next sibling of an existing block from the editor.
   * @param blockIdentifier The identifier of an existing block for which the
   * next sibling should be retrieved.
   * @returns The next sibling of the block that matches the identifier.
   * `undefined` if no matching block was found, or it's the last child/block in
   * the document.
   */
  getNextBlock(t) {
    return this.transact((o) => Bi(o.doc, t));
  }
  /**
   * Gets a snapshot of the parent of an existing block from the editor.
   * @param blockIdentifier The identifier of an existing block for which the
   * parent should be retrieved.
   * @returns The parent of the block that matches the identifier. `undefined`
   * if no matching block was found, or the block isn't nested.
   */
  getParentBlock(t) {
    return this.transact((o) => xi(o.doc, t));
  }
  /**
   * Traverses all blocks in the editor depth-first, and executes a callback for each.
   * @param callback The callback to execute for each block. Returning `false` stops the traversal.
   * @param reverse Whether the blocks should be traversed in reverse order.
   */
  forEachBlock(t, o = !1) {
    const r = this.document.slice();
    o && r.reverse();
    function s(i) {
      for (const a of i) {
        if (t(a) === !1)
          return !1;
        const c = o ? a.children.slice().reverse() : a.children;
        if (!s(c))
          return !1;
      }
      return !0;
    }
    s(r);
  }
  /**
   * Executes a callback whenever the editor's contents change.
   * @param callback The callback to execute.
   *
   * @deprecated use {@link BlockNoteEditor.onChange} instead
   */
  onEditorContentChange(t) {
    this._tiptapEditor.on("update", t);
  }
  /**
   * Executes a callback whenever the editor's selection changes.
   * @param callback The callback to execute.
   *
   * @deprecated use `onSelectionChange` instead
   */
  onEditorSelectionChange(t) {
    this._tiptapEditor.on("selectionUpdate", t);
  }
  /**
   * Gets a snapshot of the current text cursor position.
   * @returns A snapshot of the current text cursor position.
   */
  getTextCursorPosition() {
    return this.transact((t) => Li(t));
  }
  /**
   * Sets the text cursor position to the start or end of an existing block. Throws an error if the target block could
   * not be found.
   * @param targetBlock The identifier of an existing block that the text cursor should be moved to.
   * @param placement Whether the text cursor should be placed at the start or end of the block.
   */
  setTextCursorPosition(t, o = "start") {
    return this.transact(
      (r) => Xn(r, t, o)
    );
  }
  /**
   * Gets a snapshot of the current selection. This contains all blocks (included nested blocks)
   * that the selection spans across.
   *
   * If the selection starts / ends halfway through a block, the returned data will contain the entire block.
   */
  getSelection() {
    return this.transact((t) => Ti(t));
  }
  /**
   * Gets a snapshot of the current selection. This contains all blocks (included nested blocks)
   * that the selection spans across.
   *
   * If the selection starts / ends halfway through a block, the returned block will be
   * only the part of the block that is included in the selection.
   */
  getSelectionCutBlocks() {
    return this.transact((t) => Ii(t));
  }
  /**
   * Sets the selection to a range of blocks.
   * @param startBlock The identifier of the block that should be the start of the selection.
   * @param endBlock The identifier of the block that should be the end of the selection.
   */
  setSelection(t, o) {
    return this.transact((r) => Pi(r, t, o));
  }
  /**
   * Checks if the editor is currently editable, or if it's locked.
   * @returns True if the editor is editable, false otherwise.
   */
  get isEditable() {
    if (!this._tiptapEditor) {
      if (!this.headless)
        throw new Error("no editor, but also not headless?");
      return !1;
    }
    return this._tiptapEditor.isEditable === void 0 ? !0 : this._tiptapEditor.isEditable;
  }
  /**
   * Makes the editor editable or locks it, depending on the argument passed.
   * @param editable True to make the editor editable, or false to lock it.
   */
  set isEditable(t) {
    if (!this._tiptapEditor) {
      if (!this.headless)
        throw new Error("no editor, but also not headless?");
      return;
    }
    this._tiptapEditor.options.editable !== t && this._tiptapEditor.setEditable(t);
  }
  /**
   * Inserts new blocks into the editor. If a block's `id` is undefined, BlockNote generates one automatically. Throws an
   * error if the reference block could not be found.
   * @param blocksToInsert An array of partial blocks that should be inserted.
   * @param referenceBlock An identifier for an existing block, at which the new blocks should be inserted.
   * @param placement Whether the blocks should be inserted just before, just after, or nested inside the
   * `referenceBlock`.
   */
  insertBlocks(t, o, r = "before") {
    return this.transact(
      (s) => Nr(s, t, o, r)
    );
  }
  /**
   * Updates an existing block in the editor. Since updatedBlock is a PartialBlock object, some fields might not be
   * defined. These undefined fields are kept as-is from the existing block. Throws an error if the block to update could
   * not be found.
   * @param blockToUpdate The block that should be updated.
   * @param update A partial block which defines how the existing block should be changed.
   */
  updateBlock(t, o) {
    return this.transact((r) => Dr(r, t, o));
  }
  /**
   * Removes existing blocks from the editor. Throws an error if any of the blocks could not be found.
   * @param blocksToRemove An array of identifiers for existing blocks that should be removed.
   */
  removeBlocks(t) {
    return this.transact(
      (o) => $t(o, t, []).removedBlocks
    );
  }
  /**
   * Replaces existing blocks in the editor with new blocks. If the blocks that should be removed are not adjacent or
   * are at different nesting levels, `blocksToInsert` will be inserted at the position of the first block in
   * `blocksToRemove`. Throws an error if any of the blocks to remove could not be found.
   * @param blocksToRemove An array of blocks that should be replaced.
   * @param blocksToInsert An array of partial blocks to replace the old ones with.
   */
  replaceBlocks(t, o) {
    return this.transact(
      (r) => $t(r, t, o)
    );
  }
  /**
   * Undo the last action.
   */
  undo() {
    return this.options.collaboration ? this.exec(nr) : this.exec(sr);
  }
  /**
   * Redo the last action.
   */
  redo() {
    return this.options.collaboration ? this.exec(or) : this.exec(ir);
  }
  /**
   * Insert a piece of content at the current cursor position.
   *
   * @param content can be a string, or array of partial inline content elements
   */
  insertInlineContent(t, { updateSelection: o = !1 } = {}) {
    const r = W(t, this.pmSchema);
    this.transact((s) => {
      Mi(
        s,
        {
          from: s.selection.from,
          to: s.selection.to
        },
        r,
        {
          updateSelection: o
        }
      );
    });
  }
  /**
   * Gets the active text styles at the text cursor position or at the end of the current selection if it's active.
   */
  getActiveStyles() {
    return this.transact((t) => {
      const o = {}, r = t.selection.$to.marks();
      for (const s of r) {
        const i = this.schema.styleSchema[s.type.name];
        if (!i) {
          // Links are not considered styles in blocknote
          s.type.name !== "link" && // "blocknoteIgnore" tagged marks (such as comments) are also not considered BlockNote "styles"
          !s.type.spec.blocknoteIgnore && console.warn("mark not found in styleschema", s.type.name);
          continue;
        }
        i.propSchema === "boolean" ? o[i.type] = !0 : o[i.type] = s.attrs.stringValue;
      }
      return o;
    });
  }
  /**
   * Adds styles to the currently selected content.
   * @param styles The styles to add.
   */
  addStyles(t) {
    for (const [o, r] of Object.entries(t)) {
      const s = this.schema.styleSchema[o];
      if (!s)
        throw new Error(`style ${o} not found in styleSchema`);
      if (s.propSchema === "boolean")
        this._tiptapEditor.commands.setMark(o);
      else if (s.propSchema === "string")
        this._tiptapEditor.commands.setMark(o, { stringValue: r });
      else
        throw new K(s.propSchema);
    }
  }
  /**
   * Removes styles from the currently selected content.
   * @param styles The styles to remove.
   */
  removeStyles(t) {
    for (const o of Object.keys(t))
      this._tiptapEditor.commands.unsetMark(o);
  }
  /**
   * Toggles styles on the currently selected content.
   * @param styles The styles to toggle.
   */
  toggleStyles(t) {
    for (const [o, r] of Object.entries(t)) {
      const s = this.schema.styleSchema[o];
      if (!s)
        throw new Error(`style ${o} not found in styleSchema`);
      if (s.propSchema === "boolean")
        this._tiptapEditor.commands.toggleMark(o);
      else if (s.propSchema === "string")
        this._tiptapEditor.commands.toggleMark(o, { stringValue: r });
      else
        throw new K(s.propSchema);
    }
  }
  /**
   * Gets the currently selected text.
   */
  getSelectedText() {
    return this.transact((t) => t.doc.textBetween(t.selection.from, t.selection.to));
  }
  /**
   * Gets the URL of the last link in the current selection, or `undefined` if there are no links in the selection.
   */
  getSelectedLinkUrl() {
    return this._tiptapEditor.getAttributes("link").href;
  }
  /**
   * Creates a new link to replace the selected content.
   * @param url The link URL.
   * @param text The text to display the link with.
   */
  createLink(t, o) {
    if (t === "")
      return;
    const r = this.pmSchema.mark("link", { href: t });
    this.transact((s) => {
      const { from: i, to: a } = s.selection;
      o ? s.insertText(o, i, a).addMark(i, i + o.length, r) : s.setSelection(H.create(s.doc, a)).addMark(
        i,
        a,
        r
      );
    });
  }
  /**
   * Checks if the block containing the text cursor can be nested.
   */
  canNestBlock() {
    return Ci(this);
  }
  /**
   * Nests the block containing the text cursor into the block above it.
   */
  nestBlock() {
    Jn(this);
  }
  /**
   * Checks if the block containing the text cursor is nested.
   */
  canUnnestBlock() {
    return vi(this);
  }
  /**
   * Lifts the block containing the text cursor out of its parent.
   */
  unnestBlock() {
    yi(this);
  }
  /**
   * Moves the selected blocks up. If the previous block has children, moves
   * them to the end of its children. If there is no previous block, but the
   * current blocks share a common parent, moves them out of & before it.
   */
  moveBlocksUp() {
    return bi(this);
  }
  /**
   * Moves the selected blocks down. If the next block has children, moves
   * them to the start of its children. If there is no next block, but the
   * current blocks share a common parent, moves them out of & after it.
   */
  moveBlocksDown() {
    return ki(this);
  }
  /**
   * Exports blocks into a simplified HTML string. To better conform to HTML standards, children of blocks which aren't list
   * items are un-nested in the output HTML.
   *
   * @param blocks An array of blocks that should be serialized into HTML.
   * @returns The blocks, serialized as an HTML string.
   */
  async blocksToHTMLLossy(t = this.document) {
    return Ye(this.pmSchema, this).exportBlocks(t, {});
  }
  /**
   * Serializes blocks into an HTML string in the format that would normally be rendered by the editor.
   *
   * Use this method if you want to server-side render HTML (for example, a blog post that has been edited in BlockNote)
   * and serve it to users without loading the editor on the client (i.e.: displaying the blog post)
   *
   * @param blocks An array of blocks that should be serialized into HTML.
   * @returns The blocks, serialized as an HTML string.
   */
  async blocksToFullHTML(t) {
    return Ur(this.pmSchema, this).serializeBlocks(t, {});
  }
  /**
   * Parses blocks from an HTML string. Tries to create `Block` objects out of any HTML block-level elements, and
   * `InlineNode` objects from any HTML inline elements, though not all element types are recognized. If BlockNote
   * doesn't recognize an HTML element's tag, it will parse it as a paragraph or plain text.
   * @param html The HTML string to parse blocks from.
   * @returns The blocks parsed from the HTML string.
   */
  async tryParseHTMLToBlocks(t) {
    return Qn(t, this.pmSchema);
  }
  /**
   * Serializes blocks into a Markdown string. The output is simplified as Markdown does not support all features of
   * BlockNote - children of blocks which aren't list items are un-nested and certain styles are removed.
   * @param blocks An array of blocks that should be serialized into Markdown.
   * @returns The blocks, serialized as a Markdown string.
   */
  async blocksToMarkdownLossy(t = this.document) {
    return Hi(t, this.pmSchema, this, {});
  }
  /**
   * Creates a list of blocks from a Markdown string. Tries to create `Block` and `InlineNode` objects based on
   * Markdown syntax, though not all symbols are recognized. If BlockNote doesn't recognize a symbol, it will parse it
   * as text.
   * @param markdown The Markdown string to parse blocks from.
   * @returns The blocks parsed from the Markdown string.
   */
  async tryParseMarkdownToBlocks(t) {
    return $i(t, this.pmSchema);
  }
  /**
   * Updates the user info for the current user that's shown to other collaborators.
   */
  updateCollaborationUserInfo(t) {
    if (!this.options.collaboration)
      throw new Error(
        "Cannot update collaboration user info when collaboration is disabled."
      );
    this.extensions.yCursorPlugin.updateUser(t);
  }
  /**
   * Registers a callback which will be called before any change is applied to the editor, allowing you to cancel the change.
   */
  onBeforeChange(t) {
    return this.headless ? () => {
    } : this.extensions.blockChange.subscribe(
      (o) => t(this, o)
    );
  }
  /**
   * A callback function that runs whenever the editor's contents change.
   *
   * @param callback The callback to execute.
   * @returns A function to remove the callback.
   */
  onChange(t) {
    if (this.headless)
      return;
    const o = ({
      transaction: r,
      appendedTransactions: s
    }) => {
      t(this, {
        getChanges: () => Mn(r, s)
      });
    };
    return this._tiptapEditor.on("v3-update", o), () => {
      this._tiptapEditor.off("v3-update", o);
    };
  }
  /**
   * A callback function that runs whenever the text cursor position or selection changes.
   *
   * @param callback The callback to execute.
   * @returns A function to remove the callback.
   */
  onSelectionChange(t, o) {
    if (this.headless)
      return;
    const r = (s) => {
      s.transaction.getMeta(de) && !o || t(this);
    };
    return this._tiptapEditor.on("selectionUpdate", r), () => {
      this._tiptapEditor.off("selectionUpdate", r);
    };
  }
  /**
   * A callback function that runs when the editor has been initialized.
   *
   * This can be useful for plugins to initialize themselves after the editor has been initialized.
   */
  onCreate(t) {
    return this.on("create", t), () => {
      this.off("create", t);
    };
  }
  getSelectionBoundingBox() {
    if (!this.prosemirrorView)
      return;
    const { selection: t } = this.prosemirrorState, { ranges: o } = t, r = Math.min(...o.map((i) => i.$from.pos)), s = Math.max(...o.map((i) => i.$to.pos));
    if (st(t)) {
      const i = this.prosemirrorView.nodeDOM(r);
      if (i)
        return i.getBoundingClientRect();
    }
    return Ue(this.prosemirrorView, r, s);
  }
  get isEmpty() {
    const t = this.document;
    return t.length === 0 || t.length === 1 && t[0].type === "paragraph" && t[0].content.length === 0;
  }
  openSuggestionMenu(t, o) {
    this.prosemirrorView && (this.focus(), this.transact((r) => {
      o != null && o.deleteTriggerCharacter && r.insertText(t), r.scrollIntoView().setMeta(this.suggestionMenus.plugins[0], {
        triggerCharacter: t,
        deleteTriggerCharacter: (o == null ? void 0 : o.deleteTriggerCharacter) || !1,
        ignoreQueryLength: (o == null ? void 0 : o.ignoreQueryLength) || !1
      });
    }));
  }
  // `forceSelectionVisible` determines whether the editor selection is shows
  // even when the editor is not focused. This is useful for e.g. creating new
  // links, so the user still sees the affected content when an input field is
  // focused.
  // TODO: Reconsider naming?
  getForceSelectionVisible() {
    return this.showSelectionPlugin.getEnabled();
  }
  setForceSelectionVisible(t) {
    this.showSelectionPlugin.setEnabled(t);
  }
  /**
   * This will convert HTML into a format that is compatible with BlockNote.
   */
  convertHtmlToBlockNoteHtml(t) {
    return Zn(t.trim()).innerHTML;
  }
  /**
   * Paste HTML into the editor. Defaults to converting HTML to BlockNote HTML.
   * @param html The HTML to paste.
   * @param raw Whether to paste the HTML as is, or to convert it to BlockNote HTML.
   */
  pasteHTML(t, o = !1) {
    var s;
    let r = t;
    o || (r = this.convertHtmlToBlockNoteHtml(t)), r && ((s = this.prosemirrorView) == null || s.pasteHTML(r));
  }
  /**
   * Paste text into the editor. Defaults to interpreting text as markdown.
   * @param text The text to paste.
   */
  pasteText(t) {
    var o;
    return (o = this.prosemirrorView) == null ? void 0 : o.pasteText(t);
  }
  /**
   * Paste markdown into the editor.
   * @param markdown The markdown to paste.
   */
  async pasteMarkdown(t) {
    return this.pasteHTML(await eo(t));
  }
}
const cl = {
  gray: {
    text: "#9b9a97",
    background: "#ebeced"
  },
  brown: {
    text: "#64473a",
    background: "#e9e5e3"
  },
  red: {
    text: "#e03e3e",
    background: "#fbe4e4"
  },
  orange: {
    text: "#d9730d",
    background: "#f6e9d9"
  },
  yellow: {
    text: "#dfab01",
    background: "#fbf3db"
  },
  green: {
    text: "#4d6461",
    background: "#ddedea"
  },
  blue: {
    text: "#0b6e99",
    background: "#ddebf1"
  },
  purple: {
    text: "#6940a5",
    background: "#eae4f2"
  },
  pink: {
    text: "#ad1a72",
    background: "#f4dfeb"
  }
}, ll = {
  gray: {
    text: "#bebdb8",
    background: "#9b9a97"
  },
  brown: {
    text: "#8e6552",
    background: "#64473a"
  },
  red: {
    text: "#ec4040",
    background: "#be3434"
  },
  orange: {
    text: "#e3790d",
    background: "#b7600a"
  },
  yellow: {
    text: "#dfab01",
    background: "#b58b00"
  },
  green: {
    text: "#6b8b87",
    background: "#4d6461"
  },
  blue: {
    text: "#0e87bc",
    background: "#0b6e99"
  },
  purple: {
    text: "#8552d7",
    background: "#6940a5"
  },
  pink: {
    text: "#da208f",
    background: "#ad1a72"
  }
};
class dl {
  constructor(n, t, o) {
    this.mappings = t, this.options = o;
  }
  async resolveFile(n) {
    var o;
    if (!((o = this.options) != null && o.resolveFileUrl))
      return (await fetch(n)).blob();
    const t = await this.options.resolveFileUrl(n);
    return t instanceof Blob ? t : (await fetch(t)).blob();
  }
  mapStyles(n) {
    return Object.entries(n).map(([o, r]) => this.mappings.styleMapping[o](r, this));
  }
  mapInlineContent(n) {
    return this.mappings.inlineContentMapping[n.type](
      n,
      this
    );
  }
  transformInlineContent(n) {
    return n.map((t) => this.mapInlineContent(t));
  }
  async mapBlock(n, t, o, r) {
    return this.mappings.blockMapping[n.type](
      n,
      this,
      t,
      o,
      r
    );
  }
}
function ul(e) {
  return {
    createBlockMapping: (n) => n,
    createInlineContentMapping: (n) => n,
    createStyleMapping: (n) => n
  };
}
let Re;
async function bc() {
  return Re || (Re = (async () => {
    const [e, n] = await Promise.all([
      import("emoji-mart"),
      // use a dynamic import to encourage bundle-splitting
      // and a smaller initial client bundle size
      import("@emoji-mart/data")
    ]), t = "default" in e ? e.default : e, o = "default" in n ? n.default : n;
    return await t.init({ data: o }), { emojiMart: t, emojiData: o };
  })(), Re);
}
async function pl(e, n) {
  if (!si("text", e))
    return [];
  const { emojiData: t, emojiMart: o } = await bc();
  return (n.trim() === "" ? Object.values(t.emojis) : await o.SearchIndex.search(n)).map((s) => ({
    id: s.skins[0].native,
    onItemClick: () => e.insertInlineContent(s.skins[0].native + " ")
  }));
}
function hl(e, ...n) {
  const t = [...e];
  for (const o of n)
    for (const r of o) {
      const s = t.findLastIndex(
        (i) => i.group === r.group
      );
      s === -1 ? t.push(r) : t.splice(s + 1, 0, r);
    }
  return t;
}
export {
  Jr as AudioBlock,
  co as BlockNoteEditor,
  L as BlockNoteExtension,
  Ie as BlockNoteSchema,
  ll as COLORS_DARK_MODE_DEFAULT,
  cl as COLORS_DEFAULT,
  Qr as CodeBlock,
  Pa as DEFAULT_LINK_PROTOCOL,
  Kc as EMPTY_CELL_HEIGHT,
  Un as EMPTY_CELL_WIDTH,
  Lt as EventEmitter,
  dl as Exporter,
  Wr as FILE_AUDIO_ICON_SVG,
  Fr as FILE_ICON_SVG,
  fs as FILE_IMAGE_ICON_SVG,
  Gs as FILE_VIDEO_ICON_SVG,
  ls as FileBlock,
  ba as FilePanelProsemirrorPlugin,
  ga as FilePanelView,
  ya as FormattingToolbarProsemirrorPlugin,
  ka as FormattingToolbarView,
  Qn as HTMLToBlocks,
  ys as ImageBlock,
  Ma as LinkToolbarProsemirrorPlugin,
  hi as PageBreak,
  Fa as SideMenuProsemirrorPlugin,
  Ua as SideMenuView,
  qa as SuggestionMenuProseMirrorPlugin,
  tc as TableHandlesProsemirrorPlugin,
  ec as TableHandlesView,
  je as UniqueID,
  K as UnreachableCaseError,
  Ta as VALID_LINK_PROTOCOLS,
  Zs as VideoBlock,
  Vt as addInlineContentAttributes,
  br as addInlineContentKeyboardShortcuts,
  vr as addStyleAttributes,
  hr as applyNonSelectableBlockFix,
  zc as assertEmpty,
  Gr as audioBlockConfig,
  Kr as audioParse,
  jr as audioPropSchema,
  qr as audioRender,
  Yr as audioToExternalHTML,
  he as blockToNode,
  Hi as blocksToMarkdown,
  $e as camelToDataKebab,
  tl as checkBlockHasDefaultProp,
  ii as checkBlockIsDefaultType,
  Zc as checkBlockIsFileBlock,
  el as checkBlockIsFileBlockWithPlaceholder,
  Qc as checkBlockIsFileBlockWithPreview,
  ai as checkBlockTypeHasDefaultProp,
  Jc as checkBlockTypeInSchema,
  D as checkDefaultBlockTypeInSchema,
  si as checkDefaultInlineContentTypeInSchema,
  Xc as checkInlineContentTypeInSchema,
  fi as checkPageBreakBlocksInSchema,
  Pt as cleanHTMLToMarkdown,
  hl as combineByGroup,
  qe as contentNodeToInlineContent,
  wn as contentNodeToTableContent,
  $r as createAddFileButton,
  Me as createBlockSpec,
  J as createBlockSpecFromStronglyTypedTiptapNode,
  $ as createDefaultBlockDOMOutputSpec,
  Ye as createExternalHTMLExporter,
  Mt as createFigureWithCaption,
  xt as createFileBlockWrapper,
  zr as createFileNameWithIcon,
  Gc as createInlineContentSpec,
  wr as createInlineContentSpecFromTipTapNode,
  gn as createInternalBlockSpec,
  Ur as createInternalHTMLSerializer,
  kr as createInternalInlineContentSpec,
  Cn as createInternalStyleSpec,
  Xe as createLinkWithCaption,
  On as createResizableFileBlockWrapper,
  j as createStronglyTypedTiptapNode,
  qc as createStyleSpec,
  ae as createStyleSpecFromTipTapMark,
  al as createSuggestionMenu,
  Hn as createToggleWrapper,
  oi as defaultBlockSchema,
  Fn as defaultBlockSpecs,
  Rt as defaultBlockToHTML,
  Xr as defaultCodeBlockPropSchema,
  ri as defaultInlineContentSchema,
  Wn as defaultInlineContentSpecs,
  M as defaultProps,
  Yc as defaultStyleSchema,
  zn as defaultStyleSpecs,
  ds as defaultToggledState,
  mr as docToBlocks,
  fe as esmDependencies,
  ss as fileBlockConfig,
  as as fileParse,
  rs as filePropSchema,
  is as fileRender,
  cs as fileToExternalHTML,
  jc as filenameFromURL,
  rl as filterSuggestionItems,
  X as formatKeyboardShortcut,
  wa as formattingToolbarPluginKey,
  Si as getBlock,
  St as getBlockCache,
  wt as getBlockFromPos,
  Y as getBlockInfo,
  Te as getBlockInfoFromResolvedPos,
  C as getBlockInfoFromSelection,
  Ge as getBlockInfoFromTransaction,
  yt as getBlockInfoWithManualOffset,
  dc as getBlockNoteExtensions,
  Pe as getBlockNoteSchema,
  Ct as getBlockSchema,
  bn as getBlockSchemaFromSpecs,
  Mn as getBlocksChangedByTransaction,
  Se as getColspan,
  pl as getDefaultEmojiPickerItems,
  ol as getDefaultSlashMenuItems,
  yr as getInlineContentParseRules,
  vt as getInlineContentSchema,
  yn as getInlineContentSchemaFromSpecs,
  ee as getNearestBlockPos,
  Bi as getNextBlock,
  F as getNodeById,
  il as getPageBreakSlashMenuItems,
  xi as getParentBlock,
  fr as getParseRules,
  A as getPmSchema,
  Ei as getPrevBlock,
  at as getRowspan,
  Sr as getStyleParseRules,
  we as getStyleSchema,
  vn as getStyleSchemaFromSpecs,
  gs as imageBlockConfig,
  ks as imageParse,
  ms as imagePropSchema,
  bs as imageRender,
  ws as imageToExternalHTML,
  mn as inheritedProps,
  Tt as initializeESMDependencies,
  W as inlineContentToNodes,
  Nr as insertBlocks,
  P as insertOrUpdateBlock,
  ur as isAppleOS,
  Ot as isLinkInlineContent,
  Bt as isNodeBlock,
  fn as isPartialLinkInlineContent,
  ve as isPartialTableCell,
  Wc as isSafari,
  ue as isStyledTextInlineContent,
  kt as isTableCell,
  Yt as isTableCellSelection,
  xa as linkToolbarPluginKey,
  it as mapTableCell,
  ul as mappingFactory,
  $i as markdownToBlocks,
  eo as markdownToHTML,
  ne as mergeCSSClasses,
  pr as mergeParagraphs,
  E as nodeToBlock,
  ct as nodeToCustomInlineContent,
  li as pageBreakConfig,
  ui as pageBreakParse,
  di as pageBreakRender,
  jn as pageBreakSchema,
  pi as pageBreakToExternalHTML,
  jt as parseEmbedElement,
  Je as parseFigureElement,
  ke as propsToAttributes,
  gr as prosemirrorSliceToSlicedBlocks,
  $t as removeAndInsertBlocks,
  oo as selectedFragmentToHTML,
  et as shikiHighlighterPromiseSymbol,
  Wt as shikiParserSymbol,
  $a as sideMenuPluginKey,
  Cr as stylePropsToAttributes,
  Ke as tableContentToNodes,
  Ce as tableHandlesPluginKey,
  Wa as trackPosition,
  Dr as updateBlock,
  O as updateBlockCommand,
  Tn as updateBlockTr,
  nl as uploadToTmpFilesDotOrg_DEV_ONLY,
  Ks as videoBlockConfig,
  Js as videoParse,
  qs as videoPropSchema,
  Ys as videoRender,
  Xs as videoToExternalHTML,
  sl as withPageBreak,
  Ne as wrapInBlockStructure
};
//# sourceMappingURL=blocknote.js.map

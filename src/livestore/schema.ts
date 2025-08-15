import { Events, makeSchema, State, Schema } from '@livestore/livestore'

// Define your LiveStore event schemas
export const events = {
  // Track every input change
  textTyped: Events.synced({
    name: 'textTyped',
    schema: Schema.String,
  }),
  // User selected which HTML revision is active for a page (pointer-based undo/redo)
  htmlSelectionSet: Events.synced({
    name: 'htmlSelectionSet',
    schema: Schema.Struct({
      pageId: Schema.String,
      selectedUpdatedAt: Schema.Number, // points to htmlPages.updatedAt
      updatedAt: Schema.Number,
    }),
  }),
  // Generic UI node created (HTML element added)
  uiNodeCreated: Events.synced({
    name: 'uiNodeCreated',
    schema: Schema.Struct({
      id: Schema.String,
      tag: Schema.String, // e.g., 'textarea', 'div'
      x: Schema.Number,   // position within container
      y: Schema.Number,
      parentId: Schema.String, // DOM parent id (e.g., 'root' for now)
      orderIndex: Schema.Number, // sibling order inside parent
      createdAt: Schema.Number,
    }),
  }),
  // Generic UI node removed (HTML element removed)
  uiNodeRemoved: Events.synced({
    name: 'uiNodeRemoved',
    schema: Schema.Struct({
      id: Schema.String,
      timestamp: Schema.Number,
    }),
  }),
  // Generic UI node re-added (redo of a removal)
  uiNodeReadded: Events.synced({
    name: 'uiNodeReadded',
    schema: Schema.Struct({
      id: Schema.String,
      timestamp: Schema.Number,
    }),
  }),
  // Final HTML page/content committed after streaming completes (stream kept in-memory)
  htmlPageCommitted: Events.synced({
    name: 'htmlPageCommitted',
    schema: Schema.Struct({
      pageId: Schema.String, // logical page id
      html: Schema.String,
      updatedAt: Schema.Number,
    }),
  }),
}

// Define your SQLite tables for materialized state
export const tables = {
  // Log of all typed input events
  inputLog: State.SQLite.table({
    name: 'inputLog',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      content: State.SQLite.text(),
      timestamp: State.SQLite.integer(),
    },
  }),
  // All UI nodes created
  nodes: State.SQLite.table({
    name: 'nodes',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      tag: State.SQLite.text(),
      x: State.SQLite.real(),
      y: State.SQLite.real(),
      parentId: State.SQLite.text(),
      orderIndex: State.SQLite.integer(),
      createdAt: State.SQLite.integer(),
    },
  }),
  // Removal log
  nodeRemovalLog: State.SQLite.table({
    name: 'nodeRemovalLog',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      nodeId: State.SQLite.text(),
      timestamp: State.SQLite.integer(),
    },
  }),
  // Re-add log
  nodeReaddLog: State.SQLite.table({
    name: 'nodeReaddLog',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      nodeId: State.SQLite.text(),
      timestamp: State.SQLite.integer(),
    },
  }),
  // Final HTML pages (append-only; query latest by updatedAt)
  htmlPages: State.SQLite.table({
    name: 'htmlPages',
    columns: {
      id: State.SQLite.text({ primaryKey: true }), // row id
      pageId: State.SQLite.text(),
      html: State.SQLite.text(),
      updatedAt: State.SQLite.integer(),
    },
  }),
  // Pointer history: which htmlPages.updatedAt is currently selected per pageId (append-only)
  htmlSelections: State.SQLite.table({
    name: 'htmlSelections',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      pageId: State.SQLite.text(),
      selectedUpdatedAt: State.SQLite.integer(),
      updatedAt: State.SQLite.integer(),
    },
  }),
}

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

// Define how events materialize into table state
const materializers = State.SQLite.materializers(events, {
  // Apply textTyped events to log table
  textTyped: (text) => tables.inputLog.insert({ id: genId(), content: text, timestamp: Date.now() }),
  htmlSelectionSet: (payload) =>
    tables.htmlSelections.insert({ id: genId(), pageId: payload.pageId, selectedUpdatedAt: payload.selectedUpdatedAt, updatedAt: payload.updatedAt }),
  uiNodeCreated: (payload) =>
    tables.nodes.insert({ id: payload.id, tag: payload.tag, x: payload.x, y: payload.y, parentId: payload.parentId, orderIndex: payload.orderIndex, createdAt: payload.createdAt }),
  uiNodeRemoved: (payload) =>
    tables.nodeRemovalLog.insert({ id: genId(), nodeId: payload.id, timestamp: payload.timestamp }),
  uiNodeReadded: (payload) =>
    tables.nodeReaddLog.insert({ id: genId(), nodeId: payload.id, timestamp: payload.timestamp }),
  htmlPageCommitted: (payload) =>
    [
      tables.htmlPages.insert({ id: genId(), pageId: payload.pageId, html: payload.html, updatedAt: payload.updatedAt }),
      // By default, newly committed HTML becomes the selected revision
      tables.htmlSelections.insert({ id: genId(), pageId: payload.pageId, selectedUpdatedAt: payload.updatedAt, updatedAt: Date.now() }),
    ],
})

const state = State.SQLite.makeState({ tables, materializers })

export const schema = makeSchema({ events, state })

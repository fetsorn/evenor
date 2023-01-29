import { StateCreator } from 'zustand'

export enum OverviewType {
    itinerary = "itinerary",
    graph = "graph",
}

export type EntrySlice = StateCreator<
  IStore,
  [],
  [],
  IEntrySlice
>

export type OverviewSlice = StateCreator<
  IStore,
  [],
  [],
  IOverviewSlice
>

export type FilterSlice = StateCreator<
  IStore,
  [],
  [],
  IFilterSlice
>

interface IEntrySlice {
  entry: any
  index: any
  group: any
  isEdit: boolean
  isBatch: boolean
  onBatchSelect: () => void
  onEntrySelect: (entryNew: any, indexNew: any, groupNew: any) => void
  onEntryCreate: any
  onEntrySave: (repoRoute: any) => Promise<void>
  onEntryEdit: () => void
  onEntryRevert: () => void
  onEntryDelete: any
  onEntryClose: () => void
  onFieldAdd: (label: string) => Promise<void>
  onFieldChange: (label: string, value: string) => void
  onFieldUpload: (repoRoute: any, label: string, file: any) => void
  onFieldRemove: (label: string) => void
  onFieldUploadElectron: (repoRoute: string, label: string) => void
}

interface IOverviewSlice {
  schema: any
  overview: any
  isInitialized: boolean
  initialize: (repoRoute: any, search: any) => Promise<void>
  onQueries: (repoRoute: any) => Promise<void>
}

interface IFilterSlice {
  queries: any
  groupBy: any
  overviewType: OverviewType
  onChangeGroupBy: (groupByNew: string) => void
  onChangeOverviewType: (overviewTypeNew: string) => void
  onQueryAdd: (queryField: string, queryValue: string) => Promise<void>
  onQueryRemove: (queryField: string) => Promise<void>
}

export type IStore = IEntrySlice & IOverviewSlice & IFilterSlice

import { StateCreator } from 'zustand'

export enum OverviewType {
    itinerary = "itinerary",
    graph = "graph",
    book = "book",
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
  entryOriginal: any
  index: any
  group: any
  isEdit: boolean
  isBatch: boolean
  isSettings: boolean
  onBatchSelect: () => void
  onEntrySelect: (entryNew: any, indexNew: any, groupNew: any) => void
  onEntryCreate: any
  onEntrySave: () => Promise<void>
  onEntryEdit: () => void
  onEntryRevert: () => void
  onEntryDelete: any
  onEntryClose: () => void
  onFieldAdd: (label: string) => Promise<void>
  onFieldChange: (label: string, value: string) => void
  onFieldUpload: (label: string, file: any) => void
  onFieldRemove: (label: string) => void
  onFieldUploadElectron: (label: string) => void
  onSettingsOpen: () => Promise<void>
}

interface IOverviewSlice {
  schema: any
  overview: any
  repoRoute: string
  isInitialized: boolean
  initialize: (repoRoute: any, search: any) => Promise<void>
  onQueries: () => Promise<void>
  setRepoRoute: (repoRoute: string) => void
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

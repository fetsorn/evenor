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
  isLoaded: boolean
  onFirstRender: (repoRoute: any, search: any) => Promise<void>
  onLocationChange: (search: any) => void
}

interface IFilterSlice {
  queries: any
  groupBy: any
  overviewType: OverviewType
  onChangeGroupBy: (navigate: any, search: any, groupByNew: string) => void
  onChangeOverviewType: (navigate: any, search: any, overviewTypeNew: string) => void
  onQueryAdd: (navigate: any, repoRoute: any, selected: string, searched: string) => Promise<void>
  onQueryRemove: (navigate: any, repoRoute: any, removed: string) => Promise<void>
  onLocationFilter: (search: any) => void
}

export type IStore = IEntrySlice & IOverviewSlice & IFilterSlice

---
name: zf-component
description: 在使用Aggrid、Filter组件时需要参考使用方法
---
```react
<AgGrid
columns={columns}
rowModelType='serverSide'
paginationPageSize={20}
getRowId={({ data }) => data.name}
onGridReady={store.onGridEvent.bind(store)}
suppressContextMenu
suppressMovableColumns
defaultColDef={{ sortable: false, suppressHeaderMenuButton: true }}
/>
```
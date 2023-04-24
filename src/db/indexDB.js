// 获取indexDB
const indexedDB = window.indexedDB || window.webkitindexedDB || window.msIndexedDB || window.mozIndexedDB

/**
 * 打开数据库
 * @param {string} dbname 数据库名称
 * @param {number} version 数据库版本
 * @param {function} callback 回调
 */
function openDB(dbname, version = 1, callback) {
  const request = indexedDB.open(dbname, version)
  request.onerror = function(e) {
    // IndexedDB数据库打开错误
    console.error(e.currentTarget.error.message)
  }
  request.onsuccess = function(e) {
    const db = e.target.result
    if (callback && (typeof callback === 'function')) {
      callback(db)
    }
  }

  // onupgradeneeded，调用创建新的储存空间
  request.onupgradeneeded = function(e) {
    const db = e.target.result
    //     if (!db.objectStoreNames.contains(newStore.name)) {
    //         let objectStore = db.createObjectStore(newStore.name, {
    //             keyPath: newStore.key,
    //         });
    //         objectStore.createIndex('counter_index', 'counter', { unique: false });
    //         objectStore.createIndex('barcode_index', 'barcode', { unique: false });
    //         objectStore.createIndex('qty_index', 'qty', { unique: false });
    //         objectStore.createIndex('counter_code', ['counter', 'barcode'], { unique: false });
    //     }
  }
}

/**
 * 删除数据库
 * @param {string} dbname 数据库名称
 * @param {function} callback 回调
 */
function deleteDB(dbname, callback) {
  const deleteQuest = indexedDB.deleteDatabase(dbname)
  deleteQuest.onerror = function() {
    console.error(`删除数据库${dbname}出错`)
  }
  deleteQuest.onsuccess = function() {
    // 删除数据库成功
    if (callback && (typeof callback === 'function')) {
      callback()
    }
  }
}

/**
 * 关闭数据库
 * @param {IDBDatabase} db 数据库
 */
function closeDB(db) {
  db.close()
}

// ========================================================
// 以下是更新数据
// ========================================================

// 更新旧值,针对输入数量
function putData(db, storename, dataArr, callback) {
  let mybarcode = ''
  let QTY = ''
  let key = ''
  let counter = ''
  let barcode = ''
  let addtime = ''
  dataArr.forEach(item => {
    mybarcode = item.barcode
    QTY = item.qty
    barcode = item.barcode
    counter = item.counter
    key = item.counterCode
    addtime = item.addtime
  })
  this.getDataByCursor(db, storename).then(arr => {
    if (arr.length == 0) {
      // 添加
      const store = db.transaction(storename, 'readwrite').objectStore(storename)
      let request
      for (let i = 0, len = dataArr.length; i < len; i++) {
        request = store.put(dataArr[i])
        request.onerror = function() {
          console.error('PUT添加数据报错')
        }
        request.onsuccess = function(result) {
          if (callback && (typeof callback === 'function')) {
            callback()
          }
        }
      }
    } else {
      this.read(db, storename, counter, barcode).then(x => {
        if (x) {
          // 最新的值
          this.updateDataByKey(db, storename, key, QTY, addtime).then(x => {
            if (callback && (typeof callback === 'function')) {
              callback()
            }
          })
        } else {
          // 再次添加
          const store = db.transaction(storename, 'readwrite').objectStore(storename)
          let request
          for (let i = 0, len = dataArr.length; i < len; i++) {
            request = store.put(dataArr[i])
            request.onerror = function() {
              console.error('PUT添加数据报错')
            }
            request.onsuccess = function(result) {
              if (callback && (typeof callback === 'function')) {
                callback()
              }
            }
          }
        }
      })
    }
  })
}

// 更新旧值
function putDatas(db, storename, dataArr, callback) {
  let mybarcode = ''
  let QTY = ''
  let key = ''
  let counter = ''
  let barcode = ''
  let addtime = ''
  dataArr.forEach(item => {
    mybarcode = item.barcode
    QTY = item.qty
    key = item.counterCode
    counter = item.counter
    barcode = item.barcode
    addtime = item.addtime
  })
  this.getDataByCursor(db, storename).then(arr => {
    if (arr.length == 0) {
      const store = db.transaction(storename, 'readwrite').objectStore(storename)
      let request
      for (let i = 0, len = dataArr.length; i < len; i++) {
        request = store.add(dataArr[i])
        request.onerror = function() {
          console.error('PUT添加数据报错')
        }
        request.onsuccess = function(result) {
          if (callback && (typeof callback === 'function')) {
            callback()
          }
        }
      }
    } else {
      this.read(db, storename, counter, barcode).then(x => {
        if (x) {
          this.updateDataByKeys(db, storename, key, addtime).then(x => {
            this.getdata(db, storename).then(result => {
              if (callback && (typeof callback === 'function')) {
                callback()
              }
            })
          })
        } else {
          const store = db.transaction(storename, 'readwrite').objectStore(storename)
          let request
          for (let i = 0, len = dataArr.length; i < len; i++) {
            request = store.add(dataArr[i])
            request.onerror = function() {
              console.error('PUT添加数据报错')
            }
            request.onsuccess = function(result) {
              if (callback && (typeof callback === 'function')) {
                callback()
              }
            }
          }
        }
      })
    }
  })
}

// 根据key修改数量
function updateDataByKey(db, storeName, value, QTY, addtime) {
  const transaction = db.transaction(storeName, 'readwrite')
  const store = transaction.objectStore(storeName)
  const request = store.get(value)
  return new Promise((resolve, reject) => {
    request.onsuccess = function(e) {
      const stocktable = e.target.result
      if (stocktable) {
        stocktable.qty = QTY
        stocktable.addtime = addtime
        resolve(store.put(stocktable))
      } else {
        reject(false)
      }
    }
  })
}

function updateDataBycode(db, storeName, value, QTY) {
  const transaction = db.transaction(storeName, 'readwrite')
  const store = transaction.objectStore(storeName)
  const request = store.get(value)
  return new Promise((resolve, reject) => {
    request.onsuccess = function(e) {
      const stocktable = e.target.result
      if (stocktable) {
        stocktable.qty = QTY

        resolve(store.put(stocktable))
      } else {
        reject(false)
      }
    }
  })
}

// 根据key修改数量
function updateDataByKeys(db, storeName, value, addtime, callback) {
  const transaction = db.transaction(storeName, 'readwrite')
  const store = transaction.objectStore(storeName)
  const request = store.get(value)

  return new Promise((resolve, reject) => {
    request.onsuccess = function(e) {
      const stocktable = e.target.result
      if (stocktable) {
        stocktable.qty += 1
        stocktable.addtime = addtime
        resolve(store.put(stocktable))
      } else {
        reject(false)
      }
    }
  })
}

// ========================================================
// 以下是删除数据
// ========================================================

// 删除数据
function deleteData(db, storename, key, callback) {
  const store = db.transaction(storename, 'readwrite').objectStore(storename)
  store.delete(key)
  if (callback && (typeof callback === 'function')) {
    callback()
  }
}

// 清空数据
function clearData(db, storename, callback) {
  const store = db.transaction(storename, 'readwrite').objectStore(storename)
  store.clear()
  if (callback && (typeof callback === 'function')) {
    callback()
  }
}

// ========================================================
// 以下是获取数据
// ========================================================

// 通过key获取数据
function read(db, storeName, counter, barcode) {
  const transaction = db.transaction(storeName)
  const objectStore = transaction.objectStore(storeName)
  const currentdata = [counter, barcode]
  const indexs = objectStore.index('counter_code')
  const request = indexs.openCursor(IDBKeyRange.only(currentdata))
  return new Promise((resolve, reject) => {
    request.onsuccess = function(e) {
      const cursor = e.target.result
      if (cursor) {
        resolve(true)
      } else {
        resolve(false)
      }
    }
  })
}

// 根据counter索引查询数据
function getdatabyCounter(db, storeName, values) {
  const transaction = db.transaction(storeName)
  const store = transaction.objectStore(storeName)
  const indexs = store.index('counter_index')
  const datas = []
  const request = indexs.openCursor(IDBKeyRange.only(values))
  return new Promise((resolve, reject) => {
    request.onsuccess = function(e) {
      const cursor = e.target.result
      if (cursor) {
        datas.push(cursor.value)
        cursor.continue()
      } else {
        resolve(datas)
      }
    }
  })
}

// 通过barcode获取数据
function reads(db, storeName, values) {
  const transaction = db.transaction(storeName)
  const objectStore = transaction.objectStore(storeName)
  const indexs = objectStore.index('barcode_index')
  const data = []
  const request = indexs.openCursor(IDBKeyRange.only(values))
  return new Promise((resolve, reject) => {
    request.onsuccess = function(e) {
      const cursor = e.target.result
      if (cursor) {
        data.push(cursor.value)
        // resolve(data);
        cursor.continue()
      } else {
        resolve(data)
      }
    }
  })
}

// 根据主键和索引查询
function getAll(db, storeName, counter, barcode) {
  const transaction = db.transaction(storeName)
  const objectStore = transaction.objectStore(storeName)
  const counterCode = [counter, barcode]
  const indexs = objectStore.index('counter_code')
  const request = indexs.openCursor(IDBKeyRange.only(counterCode))
  const data = []
  return new Promise((resolve, reject) => {
    request.onsuccess = function(e) {
      const cursor = e.target.result
      if (cursor) {
        data.push(cursor.value)
        // resolve(data);
        cursor.continue()
      } else {
        resolve(data)
      }
    }
  })
}

// 根据key查询数量是否存在
function getqtyBykey(db, storeName, key) {
  const transaction = db.transaction(storeName)
  const objectStore = transaction.objectStore(storeName)
  const request = objectStore.get(key)
  request.onerror = function(event) {
    // 事务失败
  }
  return new Promise((resolve, reject) => {
    request.onsuccess = function(event) {
      if (request.result) {
        resolve(request.result)
      } else {
        resolve(false)
      }
    }
  })
}

/**
 * 通过游标遍历数据
 * @param {IDBDatabase} db 数据库
 * @param {string} storename 数据库名称
 */
async function getDataByCursor(db, storename) {
  const objectStore = db.transaction(storename).objectStore(storename)
  const dataList = []
  return new Promise((resolve, reject) => {
    objectStore.openCursor().onsuccess = function(event) {
      const cursor = event.target.result
      if (cursor) {
        dataList.push(cursor.value)
        cursor.continue()
      } else {
        resolve(dataList)
      }
    }
  })
}

// ========================================================
// 以下是具体的应用
// ========================================================
// 查询所有的柜台
function getAllCounter(db, storename) {
  const transaction = db.transaction(storename)
  const store = transaction.objectStore(storename)
  const indexs = store.index('counter_index')
  const data = []
  return new Promise((resolve, reject) => {
    indexs.openCursor().onsuccess = function(e) {
      const cursor = e.target.result
      if (cursor) {
        data.push(cursor.value.counter)
        resolve(data)
        cursor.continue()
      }
    }
  })
}

function getdata(db, storename) {
  const objectStore = db.transaction(storename).objectStore(storename)
  const data = []
  return new Promise((resolve, reject) => {
    objectStore.openCursor().onsuccess = function(event) {
      const cursor = event.target.result
      if (cursor) {
        data.push(cursor.value)
        resolve(data)
      } else {
        reject(false)
      }
    }
  })
}

function getqtybyqtyindex(db, storename) {
  const transaction = db.transaction(storename)
  const store = transaction.objectStore(storename)
  const indexs = store.index('qty_index')
  let sum = 0
  return new Promise((resolve, reject) => {
    indexs.openCursor().onsuccess = function(e) {
      const cursor = e.target.result
      if (cursor) {
        sum += cursor.value.qty
        cursor.continue()
      } else {
        resolve(sum)
      }
    }
  })
}

// indexedDB.js，浏览器本地数据库操作
export default {
  indexedDB,
  openDB,
  deleteDB,
  closeDB,
  putData,
  putDatas,
  updateDataByKey,
  updateDataBycode,
  updateDataByKeys,
  deleteData,
  clearData,
  read,
  getdatabyCounter,
  reads,
  getAll,
  getqtyBykey,
  getDataByCursor
}

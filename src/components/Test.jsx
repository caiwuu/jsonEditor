import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Layout, Select, Input, Dropdown, Message } from 'element-react'
import './Test.css'
import { cloneDeep } from 'lodash'

function ADD_TODO(data) {
  return (dispatch) => {
    setTimeout(() => {
      dispatch({
        type: 'ADD_TODO',
        data,
      })
    }, 200)
  }
}
function uuid() {
  var s = []
  var hexDigits = '0123456789abcdefghijklmnopqrstuvwxyz'
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 34), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = '-'

  var uuid = s.join('')
  return uuid
}
// 添加变量校验
function validation(data, item) {
  let count = 0
  data.forEach((e) => {
    e.key === item.key && count++
  })
  // 校验空串
  if (item.key === '') {
    item.validate = false
    // 唯一性校验
  } else if (count != 1) {
    item.validate = false
    // 执行纠错
  } else if (!item.validate) {
    item.validate = true
  }
}
// 删除变量校验
function delValidation(data) {
  const unValidate = data.filter((ele) => !ele.validate)
  unValidate.forEach((item) => {
    if (data.filter((e) => e.key === item.key).length === 1) {
      item.validate = true
    }
  })
}
function tableGenerator(data, level = 0) {
  return data.map((item, index) => {
    let result = (
      <Layout.Col className='tabel-row' span={24} push={1} key={item.uuid}>
        <Layout.Col span={9}>
          <Layout.Col push={level} span={1} className='expander table-generator-icon'>
            <i
              style={item.type === 'object' ? {} : { pointerEvents: 'none', opacity: 0 }}
              onClick={() => {
                item.expand = !item.expand
                this.setData()
              }}
              className={item.expand ? 'el-icon-caret-right expand-icon expanded' : 'el-icon-caret-right expand-icon'}
            ></i>
          </Layout.Col>
          <Layout.Col push={level} span={23 - level}>
            <Input
              value={item.key}
              className={!item.validate ? 'error' : ''}
              placeholder='请输入变量名称'
              size='small'
              disabled={item.disabled || item.isArrayItem}
              onChange={(e) => {
                item.key = e
                validation(data, item)
                this.setData()
              }}
            ></Input>
          </Layout.Col>
        </Layout.Col>

        <Layout.Col span={5}>
          <Input
            disabled={item.disabled}
            value={item.label}
            onChange={(e) => {
              item.label = e
              this.setData()
            }}
            placeholder='请输入变量描述'
            size='small'
          ></Input>
        </Layout.Col>
        <Layout.Col span={3}>
          <Input
            disabled={item.disabled || ['object', 'array'].includes(item.type)}
            value={item.default}
            onChange={(e) => {
              item.default = e
              this.setData()
            }}
            placeholder='请输入默认值'
            size='small'
          ></Input>
        </Layout.Col>
        <Layout.Col span={3} style={{ textAlign: 'center' }}>
          <Select
            disabled={item.disabled}
            size='small'
            value={item.type}
            onChange={(e) => {
              if (level > 10 && e === 'array') {
                Message.error('最多嵌套12层')
                return
              }
              let insertItem = {
                key: item.isArrayItem ? 'items' : item.key,
                type: e,
                label: '',
                isArrayItem: item.isArrayItem,
                default: '',
                validate: true,
                uuid: uuid(),
                expand: true,
                ...(e === 'object'
                  ? { properties: [] }
                  : e === 'array'
                  ? {
                      items: [
                        {
                          key: 'items',
                          type: 'string',
                          label: '',
                          default: '',
                          validate: true,
                          uuid: uuid(),
                          expand: true,
                          isArrayItem: true,
                        },
                      ],
                    }
                  : {}),
              }
              data.splice(index, 1, insertItem)
              this.setData()
            }}
            placeholder='请选择数据类型'
          >
            {this.state.options.map((item) => {
              return <Select.Option key={item.value} label={item.label} value={item.value}></Select.Option>
            })}
          </Select>
        </Layout.Col>
        <Layout.Col span={3}>
          {item.isArrayItem ? (
            ''
          ) : (
            <i
              onClick={() => {
                !item.validate && this.errorCount--
                data.splice(index, 1)
                delValidation(data)
                this.setData()
              }}
              className='el-icon-close table-generator-icon'
              style={
                !item.disabled
                  ? { lineHeight: '32px', cursor: 'pointer', color: '#F56C6C', marginLeft: '10px' }
                  : {
                      pointerEvents: 'none',
                      opacity: 0.4,
                      lineHeight: '32px',
                      cursor: 'pointer',
                      color: '#F56C6C',
                      marginLeft: '10px',
                    }
              }
            ></i>
          )}
          {['object'].includes(item.type) && !item.disabled && level < 7 ? (
            <Dropdown
              onCommand={(command) => {
                let insertItem = {
                  key: '',
                  type: 'string',
                  label: '',
                  default: '',
                  validate: true,
                  uuid: uuid(),
                  expand: true,
                }
                if (command === 'children') {
                  item.properties.push(insertItem)
                } else {
                  data.splice(index + 1, 0, insertItem)
                }

                validation(item.properties, insertItem)
                this.setData()
              }}
              trigger='click'
              style={{ margin: '0 10px', color: '#409EFF', cursor: 'pointer', lineHeight: '32px' }}
              menu={
                <Dropdown.Menu>
                  {['object', 'array'].includes(item.type) ? (
                    <Dropdown.Item command={'children'}>添加子节点</Dropdown.Item>
                  ) : (
                    ''
                  )}
                  {item.isArrayItem ? '' : <Dropdown.Item command={'brother'}>添加兄弟节点</Dropdown.Item>}
                </Dropdown.Menu>
              }
            >
              <span className='el-dropdown-link'>
                <i className='el-icon-arrow-down el-icon-plus'></i>
              </span>
            </Dropdown>
          ) : item.isArrayItem ? (
            ''
          ) : level > 6 ? (
            ''
          ) : (
            <i
              onClick={() => {
                let insertItem = {
                  key: '',
                  type: 'string',
                  label: '',
                  expand: true,
                  validate: true,
                  uuid: uuid(),
                  default: '',
                }
                data.splice(index + 1, 0, insertItem)
                validation(data, insertItem)
                this.setData()
              }}
              className='el-icon-plus table-generator-icon'
              style={{ lineHeight: '32px', cursor: 'pointer', color: '#409EFF', marginLeft: '10px' }}
            ></i>
          )}
        </Layout.Col>
      </Layout.Col>
    )
    return [
      result,
      ...(item.expand && (item.properties || item.items)
        ? tableGenerator.call(this, item.properties || item.items, level + 1)
        : []),
    ]
  })
}
@connect((state) => ({ data: state.app.data }), { ADD_TODO })
class Test extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      options: [
        {
          value: 'object',
          label: '对象',
        },
        {
          value: 'array',
          label: '数组',
        },
        {
          value: 'string',
          label: '字符串',
        },
        {
          value: 'boolean',
          label: '布尔',
        },
        {
          value: 'number',
          label: '数字',
        },
      ],
    }
  }
  download(name, data) {
    let urlObject = window.URL || window.webkitURL || window
    let downloadData = new Blob([data])
    let save_link = document.createElement('a')
    save_link.href = urlObject.createObjectURL(downloadData)
    save_link.download = name
    save_link.click()
  }
  genJosn() {
    let jsonObject, jsonSchema, data
    jsonObject = this.toJsonSchema(cloneDeep(this.state.data))
    jsonSchema = JSON.stringify(jsonObject)
    data = this.toData(jsonObject)
    this.download('jsonSchema.json', jsonSchema)
  }
  // jsonSchema 生成 中间体算法
  toData(jsonObject) {
    let properties,
      propertyNameMap = { array: 'items', object: 'properties' }
    properties = jsonObject.properties || jsonObject.items
    if (jsonObject.properties) {
      return Object.keys(properties).map((key) => ({
        ...properties[key],
        key: key,
        ...(properties[key][propertyNameMap[properties[key]['type']]] && {
          [propertyNameMap[properties[key]['type']]]: this.toData(properties[key]),
        }),
      }))
    }
    if (jsonObject.items) {
      return [
        {
          ...jsonObject.items,
          key: 'items',
          ...(jsonObject.items[propertyNameMap[jsonObject.items['type']]] && {
            [propertyNameMap[jsonObject.items['type']]]: this.toData(jsonObject.items),
          }),
        },
      ]
    }
  }
  // 中间体生成toJsonSchema 递归算法
  toJsonSchema(data, type = 'object') {
    let result,
      propertyNameMap = { array: 'items', object: 'properties' }
    result = {
      type: type,
      ...(propertyNameMap[type] ? { [propertyNameMap[type]]: {} } : {}),
    }
    ;['object', 'array'].includes(type) &&
      data.forEach((element) => {
        result[propertyNameMap[type]][element.key] = element
        delete element.key
        ;['object', 'array'].includes(element.type) &&
          Object.assign(
            element,
            element.type == 'object'
              ? this.toJsonSchema(element[propertyNameMap[element.type]], element.type)
              : this.toJsonSchema(element[propertyNameMap[element.type]], element.type)[propertyNameMap[element.type]]
          )
      })
    return result
  }
  readJson() {
    let inputDom = document.createElement('input')
    inputDom.type = 'file'
    inputDom.multiple = false
    inputDom.click()
    inputDom.addEventListener('change', this.fileSelectHandle)
  }
  fileSelectHandle = (e) => {
    let files = e.path[0]['files']
    if (files.length == 0) {
      Message.warning('请选择文件')
    } else {
      let reader = new FileReader()
      reader.readAsText(files[0], 'UTF-8')
      reader.onload = (evt) => {
        let fileString = evt.target.result
        let data
        try {
          data = this.toData(JSON.parse(fileString))
        } catch (error) {
          Message.error('数据格式错误')
        }
        if (!data) {
          Message.error('数据格式错误')
          return
        }
        this.setState({ data: data })
        e.path[0].removeEventListener('change', this.fileSelectHandle)
      }
    }
  }
  setData() {
    this.setState((state) => ({ data: state.data }))
  }
  render() {
    return (
      <div>
        <Layout.Row gutter={5} className='table-con'>
          <div style={{ marginBottom: '10px' }}>
            <Button
              onClick={() => {
                this.readJson()
              }}
              style={{ marginLeft: '88px' }}
              size='small'
              type='primary'
            >
              导入json
            </Button>
            <Button
              onClick={() => {
                this.genJosn()
              }}
              style={{ marginLeft: '8px' }}
              size='small'
              type='primary'
            >
              导出json
            </Button>
            <Button
              onClick={() => {
                let insertItem = {
                  key: '',
                  type: 'string',
                  label: '',
                  default: '',
                  validate: true,
                  uuid: uuid(),
                  expand: true,
                }
                this.state.data.push(insertItem)
                validation(this.state.data, insertItem)
                this.setData()
              }}
              style={{ marginLeft: '8px' }}
              size='small'
              type='primary'
            >
              添加变量
            </Button>
          </div>
          {tableGenerator.call(this, this.state.data)}
          {!this.state.data.length && (
            <Layout.Col
              className='tabel-row'
              push={1}
              span={22}
              style={{ textAlign: 'center', lineHeight: '100px', background: '#eee', color: '#aaa' }}
            >
              暂无数据
            </Layout.Col>
          )}
        </Layout.Row>
      </div>
    )
  }
}
export default Test

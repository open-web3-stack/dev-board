import React, { useState } from 'react'
import { Tag, Input, Tooltip } from 'antd'
import { config } from './config'

const EndpointSetting: React.FC<{ network: 'acala' | 'laminar'}> = ({ network }) => {
  const [state, setState] = useState({
    endpoints: config.getEndpints(network),
    inputVisible: false,
    inputValue: '',
    editInputIndex: -1,
    editInputValue: '',
  })

  const {endpoints, editInputIndex, editInputValue, inputValue, inputVisible } = state

  let input: Input
  let editInput: Input

  const handleClose = (removedEndpoint: any) => {
    const newEndpoints = endpoints.filter(endpoint => endpoint !== removedEndpoint)
    setState({ ...state, endpoints: newEndpoints })

    config.setEndpoints(network, newEndpoints)
  }

  const showInput = () => {
    setState({ ...state, inputVisible: true })
    input?.focus()
  }

  const handleInputChange = (e: any) => {
    setState({ ...state, inputValue: e.target.value })
  }

  const handleInputConfirm = () => {
    let newEndpoints = endpoints
    if (inputValue && endpoints.indexOf(inputValue) === -1) {
      newEndpoints = [...endpoints, inputValue]
    }

    setState({
      ...state,
      endpoints: newEndpoints,
      inputVisible: false,
      inputValue: '',
    })

    config.setEndpoints(network, newEndpoints)
  }

  const handleEditInputChange = (e: any) => {
    setState({ ...state, editInputValue: e.target.value })
  }

  const handleEditInputConfirm = () => {
    const newEndpoints = [...endpoints]
    newEndpoints[editInputIndex] = editInputValue

    setState({
      ...state,
      endpoints: newEndpoints,
      editInputIndex: -1,
      editInputValue: ''
    })

    config.setEndpoints(network, newEndpoints)
  }

  
  const saveInputRef = (i: Input) => {
    input = i
  }

  
  const saveEditInputRef = (input: Input) => {
    editInput = input
  }

  return (
    <div>
    {endpoints.map((endpoint, index) => {
      if (editInputIndex === index) {
        return (
          <Input
            style={{ marginBottom: '10px'}}
            ref={saveEditInputRef}
            key={endpoint}
            size="small"
            className="tag-input"
            value={editInputValue}
            onChange={handleEditInputChange}
            onBlur={handleEditInputConfirm}
            onPressEnter={handleEditInputConfirm}
          />
        )
      }

      const isLongTag = endpoint.length > 30

      const endpointElem = (
        <Tag
          style={{ marginBottom: '10px'}}
          className="edit-tag"
          key={endpoint}
          closable={index !== 0}
          onClose={() => handleClose(endpoint)}
        >
          <span
            onDoubleClick={e => {
              setState({ ...state, editInputIndex: index, editInputValue: endpoint })
              editInput?.focus()
              e.preventDefault()
            }}
          >
            {isLongTag ? `${endpoint.slice(0, 30)}...` : endpoint}
          </span>
        </Tag>
      )
      return isLongTag ? (
        <Tooltip title={endpoint} key={endpoint}>
          {endpointElem}
        </Tooltip>
      ) : (
        endpointElem
      )
    })}
    {inputVisible && (
      <Input
        ref={saveInputRef}
        style={{ marginBottom: '10px'}}
        type="text"
        size="small"
        className="tag-input"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputConfirm}
        onPressEnter={handleInputConfirm}
      />
    )}
    {!inputVisible && (
      <Tag className="site-tag-plus" style={{ marginBottom: '10px'}} onClick={showInput}>
        New Endpoint
      </Tag>
    )}
    </div>
  )
}

export default EndpointSetting
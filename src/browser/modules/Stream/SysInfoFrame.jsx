import { Component } from 'preact'
import { withBus } from 'react-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import FrameTemplate from '../Stream/FrameTemplate'
import { SysInfoTable, SysInfoTableEntry } from 'browser-components/Tables'
import bolt from 'services/bolt/bolt'
import { itemIntToString } from 'services/bolt/boltMappings'
import { toHumanReadableBytes } from 'services/utils'

export class SysInfoFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: ''
    }
  }
  responseHandler () {
    return (res) => {
      if (!res.success) {
        this.setState({error: 'No results'})
        return
      }

      const mappedJMXresult = res.result.records.map((record) => {
        const origAttributes = record.get('attributes')
        return {
          name: record.get('name'),
          description: record.get('description'),
          attributes: Object.keys(record.get('attributes')).map((attributeName) => {
            return {
              name: attributeName,
              description: origAttributes[attributeName].description,
              value: origAttributes[attributeName].value
            }
          })
        }
      })

      const jmxQueryPrefix = mappedJMXresult[0].name.split(',')[0]
      const flatResult = Object.assign({}, ...mappedJMXresult.map((item) => {
        return { [item.name]: item }
      }))

      const flattenAttributes = (a) => {
        return Object.assign({}, ...a.map(({name, value}) => ({ [name]: itemIntToString(value, bolt.neo4j.isInt, (val) => val.toString()) })))
      }

      const configurationAttributes = flattenAttributes(flatResult[`${jmxQueryPrefix},name=Configuration`].attributes)
      const kernelAttributes = flattenAttributes(flatResult[`${jmxQueryPrefix},name=Kernel`].attributes)
      const cache = flattenAttributes(flatResult[`${jmxQueryPrefix},name=Page cache`].attributes)
      const primitive = flattenAttributes(flatResult[`${jmxQueryPrefix},name=Primitive count`].attributes)
      const storeFilesSizesAttributes = flattenAttributes(flatResult[`${jmxQueryPrefix},name=Store file sizes`].attributes)
      const tx = flattenAttributes(flatResult[`${jmxQueryPrefix},name=Transactions`].attributes)

      const kernel = Object.assign({}, configurationAttributes, kernelAttributes, storeFilesSizesAttributes)

      this.setState({'storeSizes': [
        <SysInfoTableEntry label='Array Store' value={toHumanReadableBytes(kernel.ArrayStoreSize)} />,
        <SysInfoTableEntry label='Logical Log' value={toHumanReadableBytes(kernel.LogicalLogSize)} />,
        <SysInfoTableEntry label='Node Store' value={toHumanReadableBytes(kernel.NodeStoreSize)} />,
        <SysInfoTableEntry label='Property Store' value={toHumanReadableBytes(kernel.PropertyStoreSize)} />,
        <SysInfoTableEntry label='Relationship Store' value={toHumanReadableBytes(kernel.RelationshipStoreSize)} />,
        <SysInfoTableEntry label='String Store Size' value={toHumanReadableBytes(kernel.StringStoreSize)} />,
        <SysInfoTableEntry label='Total Store Size' value={toHumanReadableBytes(kernel.TotalStoreSize)} />
      ]})
      this.setState({'idAllocation': [
        <SysInfoTableEntry label='Node ID' value={primitive.NumberOfNodeIdsInUse} />,
        <SysInfoTableEntry label='Propery ID' value={primitive.NumberOfPropertyIdsInUse} />,
        <SysInfoTableEntry label='Relationship ID' value={primitive.NumberOfRelationshipIdsInUse} />,
        <SysInfoTableEntry label='Relationship Type ID' value={primitive.NumberOfRelationshipTypeIdsInUse} />
      ]})
      this.setState({'pageCache': [
        <SysInfoTableEntry label='Faults' value={cache.Faults} />,
        <SysInfoTableEntry label='Evictions' value={cache.Evictions} />,
        <SysInfoTableEntry label='File Mappings' value={cache.FileMappings} />,
        <SysInfoTableEntry label='Bytes Read' value={cache.BytesRead} />,
        <SysInfoTableEntry label='Flushes' value={cache.Flushes} />,
        <SysInfoTableEntry label='Eviction Exceptions' value={cache.EvictionExceptions} />,
        <SysInfoTableEntry label='File Unmappings' value={cache.FileUnmappings} />,
        <SysInfoTableEntry label='Bytes Written' value={cache.BytesWritten} />
      ]})
      this.setState({'transactions': [
        <SysInfoTableEntry label='Last Tx Id' value={tx.LastCommittedTxId} />,
        <SysInfoTableEntry label='Current' value={tx.NumberOfOpenTransactions} />,
        <SysInfoTableEntry label='Peak' value={tx.PeakNumberOfConcurrentTransactions} />,
        <SysInfoTableEntry label='Opened' value={tx.NumberOfOpenedTransactions} />,
        <SysInfoTableEntry label='Committed' value={tx.NumberOfCommittedTransactions} />
      ]})
    }
  }
  componentDidMount () {
    if (this.props.bus) {
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL dbms.queryJmx("org.neo4j:*")'
        },
        this.responseHandler()
      )
    }
  }
  render () {
    const content = (
      <div>
        <h3>Indexes</h3>
        <SysInfoTable header='Store Sizes'>
          {this.state.storeSizes || null}
        </SysInfoTable>
        <SysInfoTable header='ID Allocation'>
          {this.state.idAllocation || null}
        </SysInfoTable>
        <SysInfoTable header='Page Cache'>
          {this.state.pageCache || null}
        </SysInfoTable>
        <SysInfoTable header='Transactions'>
          {this.state.transactions || null}
        </SysInfoTable>
      </div>
    )
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={content}
      />
    )
  }
}
export default withBus(SysInfoFrame)

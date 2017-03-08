import { Component } from 'preact'
import FrameTemplate from '../FrameTemplate'
import { withBus } from 'react-suber'
import { listQueriesProcedure, killQueriesProcedure } from 'shared/modules/cypher/queriesProcedureHelper'
import bolt from 'services/bolt/bolt'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import {ConfirmationButton} from 'browser-components/buttons/ConfirmationButton'
import { FormButton } from 'browser-components/buttons'
import FrameError from '../FrameError'
import FrameSuccess from '../FrameSuccess'

export class QueriesFrame extends Component {
  constructor(){
    super();

    this.state = {
      queries : []
    };
  }
  componentDidMount(){
    this.getRunningQueries();
  }
  getRunningQueries(){
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: listQueriesProcedure()},
      (response) => {
        if (response.success) {
          let queries = this.extractQueriesFromBoltResult(response.result);
          this.setState({queries: queries});
        }
        else{
          let errors = this.state.errors || [];
          this.setState({errors: errors.concat([response.error]) });
        }
      }
    )
  }
  killQueries(queryIdList){
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: killQueriesProcedure(queryIdList)},
      (response) => {
        if (response.success) {
          // TODO Get Query Id and user name from response
          this.setState({success: "Query succefully cancelled"});
          this.getRunningQueries();
        }
        else{
          let errors = this.state.errors || [];
          this.setState({errors: errors.concat([response.error]) });
        }
      }
    )
  }
  extractQueriesFromBoltResult(result){
    return result.records.map((queryRecord) => {
      let queryInfo = {};
      queryRecord.keys.forEach( (key, idx) => {
          queryInfo[key] = queryRecord._fields[idx];
      });

      return queryInfo;
    })
  }

  onCancelQuery(queryId){
    this.killQueries([ queryId ]);
  }

  constructViewFromQueryList(queries) {
    if(queries.length == 0)
      return null;

    const tableRows = queries.map( (query) => {
      const connectionDetails = query.connectionDetails.split('\t');
      // TODO : check it out from old browsers code
      const databaseUri = connectionDetails[connectionDetails.length - 2];

      //"bolt-session	bolt	neo4j	neo4j-javascript/[object Object]		client/127.0.0.1:53404	server/127.0.0.1:7687>	neo4j"
      //queryId

      return (
        <tr>
          <td>{databaseUri}</td>
          <td>{query.username}</td>
          <td>{query.query}</td>
          <td>{query.parameters}</td>
          <td>{query.metaData}</td>
          <td>{query.elapsedTime}</td>
          <td><ConfirmationButton onConfirmed={this.onCancelQuery.bind(this, query.queryId)} /></td>
        </tr>)
    } );

    const tableHeaders = ['Database URI', 'User', 'Query', 'Params', 'Meta', 'Elapsed time', 'Kill'].map((heading, i) => {
      return <th key={i}>{heading}</th>
    })
    return (
      <table>
        <thead>
          <tr>
            {tableHeaders}
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
    )
  }
  render (){
    const frameContents =  this.constructViewFromQueryList(this.state.queries);
    const errors = (this.state.errors) ? this.state.errors.join(', ') : null

    return (
      <FrameTemplate
        header={this.props.frame}
        contents={frameContents}>
        <FrameError message={errors} />
        <FrameSuccess message={this.state.success} />
      </FrameTemplate>
    );
  }
}

export default withBus(QueriesFrame)

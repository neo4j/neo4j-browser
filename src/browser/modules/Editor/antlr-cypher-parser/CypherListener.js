// Generated from cypher-editor-support/src/_generated.simple/Cypher.g4 by ANTLR 4.7
// jshint ignore: start
var antlr4 = require('antlr4/index')

// This class defines a complete listener for a parse tree produced by CypherParser.
function CypherListener() {
  antlr4.tree.ParseTreeListener.call(this)
  return this
}

CypherListener.prototype = Object.create(
  antlr4.tree.ParseTreeListener.prototype
)
CypherListener.prototype.constructor = CypherListener

// Enter a parse tree produced by CypherParser#raw.
CypherListener.prototype.enterRaw = function(ctx) {}

// Exit a parse tree produced by CypherParser#raw.
CypherListener.prototype.exitRaw = function(ctx) {}

// Enter a parse tree produced by CypherParser#cypher.
CypherListener.prototype.enterCypher = function(ctx) {}

// Exit a parse tree produced by CypherParser#cypher.
CypherListener.prototype.exitCypher = function(ctx) {}

// Enter a parse tree produced by CypherParser#cypherPart.
CypherListener.prototype.enterCypherPart = function(ctx) {}

// Exit a parse tree produced by CypherParser#cypherPart.
CypherListener.prototype.exitCypherPart = function(ctx) {}

// Enter a parse tree produced by CypherParser#cypherConsoleCommand.
CypherListener.prototype.enterCypherConsoleCommand = function(ctx) {}

// Exit a parse tree produced by CypherParser#cypherConsoleCommand.
CypherListener.prototype.exitCypherConsoleCommand = function(ctx) {}

// Enter a parse tree produced by CypherParser#cypherConsoleCommandName.
CypherListener.prototype.enterCypherConsoleCommandName = function(ctx) {}

// Exit a parse tree produced by CypherParser#cypherConsoleCommandName.
CypherListener.prototype.exitCypherConsoleCommandName = function(ctx) {}

// Enter a parse tree produced by CypherParser#cypherConsoleCommandParameters.
CypherListener.prototype.enterCypherConsoleCommandParameters = function(ctx) {}

// Exit a parse tree produced by CypherParser#cypherConsoleCommandParameters.
CypherListener.prototype.exitCypherConsoleCommandParameters = function(ctx) {}

// Enter a parse tree produced by CypherParser#cypherConsoleCommandParameter.
CypherListener.prototype.enterCypherConsoleCommandParameter = function(ctx) {}

// Exit a parse tree produced by CypherParser#cypherConsoleCommandParameter.
CypherListener.prototype.exitCypherConsoleCommandParameter = function(ctx) {}

// Enter a parse tree produced by CypherParser#arrowExpression.
CypherListener.prototype.enterArrowExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#arrowExpression.
CypherListener.prototype.exitArrowExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#url.
CypherListener.prototype.enterUrl = function(ctx) {}

// Exit a parse tree produced by CypherParser#url.
CypherListener.prototype.exitUrl = function(ctx) {}

// Enter a parse tree produced by CypherParser#uri.
CypherListener.prototype.enterUri = function(ctx) {}

// Exit a parse tree produced by CypherParser#uri.
CypherListener.prototype.exitUri = function(ctx) {}

// Enter a parse tree produced by CypherParser#scheme.
CypherListener.prototype.enterScheme = function(ctx) {}

// Exit a parse tree produced by CypherParser#scheme.
CypherListener.prototype.exitScheme = function(ctx) {}

// Enter a parse tree produced by CypherParser#host.
CypherListener.prototype.enterHost = function(ctx) {}

// Exit a parse tree produced by CypherParser#host.
CypherListener.prototype.exitHost = function(ctx) {}

// Enter a parse tree produced by CypherParser#hostname.
CypherListener.prototype.enterHostname = function(ctx) {}

// Exit a parse tree produced by CypherParser#hostname.
CypherListener.prototype.exitHostname = function(ctx) {}

// Enter a parse tree produced by CypherParser#hostnumber.
CypherListener.prototype.enterHostnumber = function(ctx) {}

// Exit a parse tree produced by CypherParser#hostnumber.
CypherListener.prototype.exitHostnumber = function(ctx) {}

// Enter a parse tree produced by CypherParser#port.
CypherListener.prototype.enterPort = function(ctx) {}

// Exit a parse tree produced by CypherParser#port.
CypherListener.prototype.exitPort = function(ctx) {}

// Enter a parse tree produced by CypherParser#path.
CypherListener.prototype.enterPath = function(ctx) {}

// Exit a parse tree produced by CypherParser#path.
CypherListener.prototype.exitPath = function(ctx) {}

// Enter a parse tree produced by CypherParser#user.
CypherListener.prototype.enterUser = function(ctx) {}

// Exit a parse tree produced by CypherParser#user.
CypherListener.prototype.exitUser = function(ctx) {}

// Enter a parse tree produced by CypherParser#login.
CypherListener.prototype.enterLogin = function(ctx) {}

// Exit a parse tree produced by CypherParser#login.
CypherListener.prototype.exitLogin = function(ctx) {}

// Enter a parse tree produced by CypherParser#password.
CypherListener.prototype.enterPassword = function(ctx) {}

// Exit a parse tree produced by CypherParser#password.
CypherListener.prototype.exitPassword = function(ctx) {}

// Enter a parse tree produced by CypherParser#frag.
CypherListener.prototype.enterFrag = function(ctx) {}

// Exit a parse tree produced by CypherParser#frag.
CypherListener.prototype.exitFrag = function(ctx) {}

// Enter a parse tree produced by CypherParser#urlQuery.
CypherListener.prototype.enterUrlQuery = function(ctx) {}

// Exit a parse tree produced by CypherParser#urlQuery.
CypherListener.prototype.exitUrlQuery = function(ctx) {}

// Enter a parse tree produced by CypherParser#search.
CypherListener.prototype.enterSearch = function(ctx) {}

// Exit a parse tree produced by CypherParser#search.
CypherListener.prototype.exitSearch = function(ctx) {}

// Enter a parse tree produced by CypherParser#searchparameter.
CypherListener.prototype.enterSearchparameter = function(ctx) {}

// Exit a parse tree produced by CypherParser#searchparameter.
CypherListener.prototype.exitSearchparameter = function(ctx) {}

// Enter a parse tree produced by CypherParser#string.
CypherListener.prototype.enterString = function(ctx) {}

// Exit a parse tree produced by CypherParser#string.
CypherListener.prototype.exitString = function(ctx) {}

// Enter a parse tree produced by CypherParser#urlDigits.
CypherListener.prototype.enterUrlDigits = function(ctx) {}

// Exit a parse tree produced by CypherParser#urlDigits.
CypherListener.prototype.exitUrlDigits = function(ctx) {}

// Enter a parse tree produced by CypherParser#json.
CypherListener.prototype.enterJson = function(ctx) {}

// Exit a parse tree produced by CypherParser#json.
CypherListener.prototype.exitJson = function(ctx) {}

// Enter a parse tree produced by CypherParser#obj.
CypherListener.prototype.enterObj = function(ctx) {}

// Exit a parse tree produced by CypherParser#obj.
CypherListener.prototype.exitObj = function(ctx) {}

// Enter a parse tree produced by CypherParser#pair.
CypherListener.prototype.enterPair = function(ctx) {}

// Exit a parse tree produced by CypherParser#pair.
CypherListener.prototype.exitPair = function(ctx) {}

// Enter a parse tree produced by CypherParser#array.
CypherListener.prototype.enterArray = function(ctx) {}

// Exit a parse tree produced by CypherParser#array.
CypherListener.prototype.exitArray = function(ctx) {}

// Enter a parse tree produced by CypherParser#value.
CypherListener.prototype.enterValue = function(ctx) {}

// Exit a parse tree produced by CypherParser#value.
CypherListener.prototype.exitValue = function(ctx) {}

// Enter a parse tree produced by CypherParser#keyValueLiteral.
CypherListener.prototype.enterKeyValueLiteral = function(ctx) {}

// Exit a parse tree produced by CypherParser#keyValueLiteral.
CypherListener.prototype.exitKeyValueLiteral = function(ctx) {}

// Enter a parse tree produced by CypherParser#commandPath.
CypherListener.prototype.enterCommandPath = function(ctx) {}

// Exit a parse tree produced by CypherParser#commandPath.
CypherListener.prototype.exitCommandPath = function(ctx) {}

// Enter a parse tree produced by CypherParser#subCommand.
CypherListener.prototype.enterSubCommand = function(ctx) {}

// Exit a parse tree produced by CypherParser#subCommand.
CypherListener.prototype.exitSubCommand = function(ctx) {}

// Enter a parse tree produced by CypherParser#cypherQuery.
CypherListener.prototype.enterCypherQuery = function(ctx) {}

// Exit a parse tree produced by CypherParser#cypherQuery.
CypherListener.prototype.exitCypherQuery = function(ctx) {}

// Enter a parse tree produced by CypherParser#queryOptions.
CypherListener.prototype.enterQueryOptions = function(ctx) {}

// Exit a parse tree produced by CypherParser#queryOptions.
CypherListener.prototype.exitQueryOptions = function(ctx) {}

// Enter a parse tree produced by CypherParser#anyCypherOption.
CypherListener.prototype.enterAnyCypherOption = function(ctx) {}

// Exit a parse tree produced by CypherParser#anyCypherOption.
CypherListener.prototype.exitAnyCypherOption = function(ctx) {}

// Enter a parse tree produced by CypherParser#cypherOption.
CypherListener.prototype.enterCypherOption = function(ctx) {}

// Exit a parse tree produced by CypherParser#cypherOption.
CypherListener.prototype.exitCypherOption = function(ctx) {}

// Enter a parse tree produced by CypherParser#versionNumber.
CypherListener.prototype.enterVersionNumber = function(ctx) {}

// Exit a parse tree produced by CypherParser#versionNumber.
CypherListener.prototype.exitVersionNumber = function(ctx) {}

// Enter a parse tree produced by CypherParser#explain.
CypherListener.prototype.enterExplain = function(ctx) {}

// Exit a parse tree produced by CypherParser#explain.
CypherListener.prototype.exitExplain = function(ctx) {}

// Enter a parse tree produced by CypherParser#profile.
CypherListener.prototype.enterProfile = function(ctx) {}

// Exit a parse tree produced by CypherParser#profile.
CypherListener.prototype.exitProfile = function(ctx) {}

// Enter a parse tree produced by CypherParser#configurationOption.
CypherListener.prototype.enterConfigurationOption = function(ctx) {}

// Exit a parse tree produced by CypherParser#configurationOption.
CypherListener.prototype.exitConfigurationOption = function(ctx) {}

// Enter a parse tree produced by CypherParser#statement.
CypherListener.prototype.enterStatement = function(ctx) {}

// Exit a parse tree produced by CypherParser#statement.
CypherListener.prototype.exitStatement = function(ctx) {}

// Enter a parse tree produced by CypherParser#query.
CypherListener.prototype.enterQuery = function(ctx) {}

// Exit a parse tree produced by CypherParser#query.
CypherListener.prototype.exitQuery = function(ctx) {}

// Enter a parse tree produced by CypherParser#regularQuery.
CypherListener.prototype.enterRegularQuery = function(ctx) {}

// Exit a parse tree produced by CypherParser#regularQuery.
CypherListener.prototype.exitRegularQuery = function(ctx) {}

// Enter a parse tree produced by CypherParser#bulkImportQuery.
CypherListener.prototype.enterBulkImportQuery = function(ctx) {}

// Exit a parse tree produced by CypherParser#bulkImportQuery.
CypherListener.prototype.exitBulkImportQuery = function(ctx) {}

// Enter a parse tree produced by CypherParser#singleQuery.
CypherListener.prototype.enterSingleQuery = function(ctx) {}

// Exit a parse tree produced by CypherParser#singleQuery.
CypherListener.prototype.exitSingleQuery = function(ctx) {}

// Enter a parse tree produced by CypherParser#periodicCommitHint.
CypherListener.prototype.enterPeriodicCommitHint = function(ctx) {}

// Exit a parse tree produced by CypherParser#periodicCommitHint.
CypherListener.prototype.exitPeriodicCommitHint = function(ctx) {}

// Enter a parse tree produced by CypherParser#loadCSVQuery.
CypherListener.prototype.enterLoadCSVQuery = function(ctx) {}

// Exit a parse tree produced by CypherParser#loadCSVQuery.
CypherListener.prototype.exitLoadCSVQuery = function(ctx) {}

// Enter a parse tree produced by CypherParser#union.
CypherListener.prototype.enterUnion = function(ctx) {}

// Exit a parse tree produced by CypherParser#union.
CypherListener.prototype.exitUnion = function(ctx) {}

// Enter a parse tree produced by CypherParser#clause.
CypherListener.prototype.enterClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#clause.
CypherListener.prototype.exitClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#command.
CypherListener.prototype.enterCommand = function(ctx) {}

// Exit a parse tree produced by CypherParser#command.
CypherListener.prototype.exitCommand = function(ctx) {}

// Enter a parse tree produced by CypherParser#createUniqueConstraint.
CypherListener.prototype.enterCreateUniqueConstraint = function(ctx) {}

// Exit a parse tree produced by CypherParser#createUniqueConstraint.
CypherListener.prototype.exitCreateUniqueConstraint = function(ctx) {}

// Enter a parse tree produced by CypherParser#createNodeKeyConstraint.
CypherListener.prototype.enterCreateNodeKeyConstraint = function(ctx) {}

// Exit a parse tree produced by CypherParser#createNodeKeyConstraint.
CypherListener.prototype.exitCreateNodeKeyConstraint = function(ctx) {}

// Enter a parse tree produced by CypherParser#createNodePropertyExistenceConstraint.
CypherListener.prototype.enterCreateNodePropertyExistenceConstraint = function(
  ctx
) {}

// Exit a parse tree produced by CypherParser#createNodePropertyExistenceConstraint.
CypherListener.prototype.exitCreateNodePropertyExistenceConstraint = function(
  ctx
) {}

// Enter a parse tree produced by CypherParser#createRelationshipPropertyExistenceConstraint.
CypherListener.prototype.enterCreateRelationshipPropertyExistenceConstraint = function(
  ctx
) {}

// Exit a parse tree produced by CypherParser#createRelationshipPropertyExistenceConstraint.
CypherListener.prototype.exitCreateRelationshipPropertyExistenceConstraint = function(
  ctx
) {}

// Enter a parse tree produced by CypherParser#createIndex.
CypherListener.prototype.enterCreateIndex = function(ctx) {}

// Exit a parse tree produced by CypherParser#createIndex.
CypherListener.prototype.exitCreateIndex = function(ctx) {}

// Enter a parse tree produced by CypherParser#dropUniqueConstraint.
CypherListener.prototype.enterDropUniqueConstraint = function(ctx) {}

// Exit a parse tree produced by CypherParser#dropUniqueConstraint.
CypherListener.prototype.exitDropUniqueConstraint = function(ctx) {}

// Enter a parse tree produced by CypherParser#dropNodeKeyConstraint.
CypherListener.prototype.enterDropNodeKeyConstraint = function(ctx) {}

// Exit a parse tree produced by CypherParser#dropNodeKeyConstraint.
CypherListener.prototype.exitDropNodeKeyConstraint = function(ctx) {}

// Enter a parse tree produced by CypherParser#dropNodePropertyExistenceConstraint.
CypherListener.prototype.enterDropNodePropertyExistenceConstraint = function(
  ctx
) {}

// Exit a parse tree produced by CypherParser#dropNodePropertyExistenceConstraint.
CypherListener.prototype.exitDropNodePropertyExistenceConstraint = function(
  ctx
) {}

// Enter a parse tree produced by CypherParser#dropRelationshipPropertyExistenceConstraint.
CypherListener.prototype.enterDropRelationshipPropertyExistenceConstraint = function(
  ctx
) {}

// Exit a parse tree produced by CypherParser#dropRelationshipPropertyExistenceConstraint.
CypherListener.prototype.exitDropRelationshipPropertyExistenceConstraint = function(
  ctx
) {}

// Enter a parse tree produced by CypherParser#dropIndex.
CypherListener.prototype.enterDropIndex = function(ctx) {}

// Exit a parse tree produced by CypherParser#dropIndex.
CypherListener.prototype.exitDropIndex = function(ctx) {}

// Enter a parse tree produced by CypherParser#index.
CypherListener.prototype.enterIndex = function(ctx) {}

// Exit a parse tree produced by CypherParser#index.
CypherListener.prototype.exitIndex = function(ctx) {}

// Enter a parse tree produced by CypherParser#uniqueConstraint.
CypherListener.prototype.enterUniqueConstraint = function(ctx) {}

// Exit a parse tree produced by CypherParser#uniqueConstraint.
CypherListener.prototype.exitUniqueConstraint = function(ctx) {}

// Enter a parse tree produced by CypherParser#nodeKeyConstraint.
CypherListener.prototype.enterNodeKeyConstraint = function(ctx) {}

// Exit a parse tree produced by CypherParser#nodeKeyConstraint.
CypherListener.prototype.exitNodeKeyConstraint = function(ctx) {}

// Enter a parse tree produced by CypherParser#nodePropertyExistenceConstraint.
CypherListener.prototype.enterNodePropertyExistenceConstraint = function(ctx) {}

// Exit a parse tree produced by CypherParser#nodePropertyExistenceConstraint.
CypherListener.prototype.exitNodePropertyExistenceConstraint = function(ctx) {}

// Enter a parse tree produced by CypherParser#relationshipPropertyExistenceConstraint.
CypherListener.prototype.enterRelationshipPropertyExistenceConstraint = function(
  ctx
) {}

// Exit a parse tree produced by CypherParser#relationshipPropertyExistenceConstraint.
CypherListener.prototype.exitRelationshipPropertyExistenceConstraint = function(
  ctx
) {}

// Enter a parse tree produced by CypherParser#relationshipPatternSyntax.
CypherListener.prototype.enterRelationshipPatternSyntax = function(ctx) {}

// Exit a parse tree produced by CypherParser#relationshipPatternSyntax.
CypherListener.prototype.exitRelationshipPatternSyntax = function(ctx) {}

// Enter a parse tree produced by CypherParser#loadCSVClause.
CypherListener.prototype.enterLoadCSVClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#loadCSVClause.
CypherListener.prototype.exitLoadCSVClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#matchClause.
CypherListener.prototype.enterMatchClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#matchClause.
CypherListener.prototype.exitMatchClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#unwindClause.
CypherListener.prototype.enterUnwindClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#unwindClause.
CypherListener.prototype.exitUnwindClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#mergeClause.
CypherListener.prototype.enterMergeClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#mergeClause.
CypherListener.prototype.exitMergeClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#mergeAction.
CypherListener.prototype.enterMergeAction = function(ctx) {}

// Exit a parse tree produced by CypherParser#mergeAction.
CypherListener.prototype.exitMergeAction = function(ctx) {}

// Enter a parse tree produced by CypherParser#createClause.
CypherListener.prototype.enterCreateClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#createClause.
CypherListener.prototype.exitCreateClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#createUniqueClause.
CypherListener.prototype.enterCreateUniqueClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#createUniqueClause.
CypherListener.prototype.exitCreateUniqueClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#setClause.
CypherListener.prototype.enterSetClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#setClause.
CypherListener.prototype.exitSetClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#setItem.
CypherListener.prototype.enterSetItem = function(ctx) {}

// Exit a parse tree produced by CypherParser#setItem.
CypherListener.prototype.exitSetItem = function(ctx) {}

// Enter a parse tree produced by CypherParser#deleteClause.
CypherListener.prototype.enterDeleteClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#deleteClause.
CypherListener.prototype.exitDeleteClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#removeClause.
CypherListener.prototype.enterRemoveClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#removeClause.
CypherListener.prototype.exitRemoveClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#removeItem.
CypherListener.prototype.enterRemoveItem = function(ctx) {}

// Exit a parse tree produced by CypherParser#removeItem.
CypherListener.prototype.exitRemoveItem = function(ctx) {}

// Enter a parse tree produced by CypherParser#foreachClause.
CypherListener.prototype.enterForeachClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#foreachClause.
CypherListener.prototype.exitForeachClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#withClause.
CypherListener.prototype.enterWithClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#withClause.
CypherListener.prototype.exitWithClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#returnClause.
CypherListener.prototype.enterReturnClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#returnClause.
CypherListener.prototype.exitReturnClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#returnBody.
CypherListener.prototype.enterReturnBody = function(ctx) {}

// Exit a parse tree produced by CypherParser#returnBody.
CypherListener.prototype.exitReturnBody = function(ctx) {}

// Enter a parse tree produced by CypherParser#func.
CypherListener.prototype.enterFunc = function(ctx) {}

// Exit a parse tree produced by CypherParser#func.
CypherListener.prototype.exitFunc = function(ctx) {}

// Enter a parse tree produced by CypherParser#returnItems.
CypherListener.prototype.enterReturnItems = function(ctx) {}

// Exit a parse tree produced by CypherParser#returnItems.
CypherListener.prototype.exitReturnItems = function(ctx) {}

// Enter a parse tree produced by CypherParser#returnItem.
CypherListener.prototype.enterReturnItem = function(ctx) {}

// Exit a parse tree produced by CypherParser#returnItem.
CypherListener.prototype.exitReturnItem = function(ctx) {}

// Enter a parse tree produced by CypherParser#call.
CypherListener.prototype.enterCall = function(ctx) {}

// Exit a parse tree produced by CypherParser#call.
CypherListener.prototype.exitCall = function(ctx) {}

// Enter a parse tree produced by CypherParser#procedureInvocation.
CypherListener.prototype.enterProcedureInvocation = function(ctx) {}

// Exit a parse tree produced by CypherParser#procedureInvocation.
CypherListener.prototype.exitProcedureInvocation = function(ctx) {}

// Enter a parse tree produced by CypherParser#procedureInvocationBody.
CypherListener.prototype.enterProcedureInvocationBody = function(ctx) {}

// Exit a parse tree produced by CypherParser#procedureInvocationBody.
CypherListener.prototype.exitProcedureInvocationBody = function(ctx) {}

// Enter a parse tree produced by CypherParser#procedureArguments.
CypherListener.prototype.enterProcedureArguments = function(ctx) {}

// Exit a parse tree produced by CypherParser#procedureArguments.
CypherListener.prototype.exitProcedureArguments = function(ctx) {}

// Enter a parse tree produced by CypherParser#procedureResults.
CypherListener.prototype.enterProcedureResults = function(ctx) {}

// Exit a parse tree produced by CypherParser#procedureResults.
CypherListener.prototype.exitProcedureResults = function(ctx) {}

// Enter a parse tree produced by CypherParser#procedureResult.
CypherListener.prototype.enterProcedureResult = function(ctx) {}

// Exit a parse tree produced by CypherParser#procedureResult.
CypherListener.prototype.exitProcedureResult = function(ctx) {}

// Enter a parse tree produced by CypherParser#aliasedProcedureResult.
CypherListener.prototype.enterAliasedProcedureResult = function(ctx) {}

// Exit a parse tree produced by CypherParser#aliasedProcedureResult.
CypherListener.prototype.exitAliasedProcedureResult = function(ctx) {}

// Enter a parse tree produced by CypherParser#simpleProcedureResult.
CypherListener.prototype.enterSimpleProcedureResult = function(ctx) {}

// Exit a parse tree produced by CypherParser#simpleProcedureResult.
CypherListener.prototype.exitSimpleProcedureResult = function(ctx) {}

// Enter a parse tree produced by CypherParser#procedureOutput.
CypherListener.prototype.enterProcedureOutput = function(ctx) {}

// Exit a parse tree produced by CypherParser#procedureOutput.
CypherListener.prototype.exitProcedureOutput = function(ctx) {}

// Enter a parse tree produced by CypherParser#order.
CypherListener.prototype.enterOrder = function(ctx) {}

// Exit a parse tree produced by CypherParser#order.
CypherListener.prototype.exitOrder = function(ctx) {}

// Enter a parse tree produced by CypherParser#skip.
CypherListener.prototype.enterSkip = function(ctx) {}

// Exit a parse tree produced by CypherParser#skip.
CypherListener.prototype.exitSkip = function(ctx) {}

// Enter a parse tree produced by CypherParser#limit.
CypherListener.prototype.enterLimit = function(ctx) {}

// Exit a parse tree produced by CypherParser#limit.
CypherListener.prototype.exitLimit = function(ctx) {}

// Enter a parse tree produced by CypherParser#sortItem.
CypherListener.prototype.enterSortItem = function(ctx) {}

// Exit a parse tree produced by CypherParser#sortItem.
CypherListener.prototype.exitSortItem = function(ctx) {}

// Enter a parse tree produced by CypherParser#hint.
CypherListener.prototype.enterHint = function(ctx) {}

// Exit a parse tree produced by CypherParser#hint.
CypherListener.prototype.exitHint = function(ctx) {}

// Enter a parse tree produced by CypherParser#startClause.
CypherListener.prototype.enterStartClause = function(ctx) {}

// Exit a parse tree produced by CypherParser#startClause.
CypherListener.prototype.exitStartClause = function(ctx) {}

// Enter a parse tree produced by CypherParser#startPoint.
CypherListener.prototype.enterStartPoint = function(ctx) {}

// Exit a parse tree produced by CypherParser#startPoint.
CypherListener.prototype.exitStartPoint = function(ctx) {}

// Enter a parse tree produced by CypherParser#lookup.
CypherListener.prototype.enterLookup = function(ctx) {}

// Exit a parse tree produced by CypherParser#lookup.
CypherListener.prototype.exitLookup = function(ctx) {}

// Enter a parse tree produced by CypherParser#nodeLookup.
CypherListener.prototype.enterNodeLookup = function(ctx) {}

// Exit a parse tree produced by CypherParser#nodeLookup.
CypherListener.prototype.exitNodeLookup = function(ctx) {}

// Enter a parse tree produced by CypherParser#relationshipLookup.
CypherListener.prototype.enterRelationshipLookup = function(ctx) {}

// Exit a parse tree produced by CypherParser#relationshipLookup.
CypherListener.prototype.exitRelationshipLookup = function(ctx) {}

// Enter a parse tree produced by CypherParser#identifiedIndexLookup.
CypherListener.prototype.enterIdentifiedIndexLookup = function(ctx) {}

// Exit a parse tree produced by CypherParser#identifiedIndexLookup.
CypherListener.prototype.exitIdentifiedIndexLookup = function(ctx) {}

// Enter a parse tree produced by CypherParser#indexQuery.
CypherListener.prototype.enterIndexQuery = function(ctx) {}

// Exit a parse tree produced by CypherParser#indexQuery.
CypherListener.prototype.exitIndexQuery = function(ctx) {}

// Enter a parse tree produced by CypherParser#idLookup.
CypherListener.prototype.enterIdLookup = function(ctx) {}

// Exit a parse tree produced by CypherParser#idLookup.
CypherListener.prototype.exitIdLookup = function(ctx) {}

// Enter a parse tree produced by CypherParser#literalIds.
CypherListener.prototype.enterLiteralIds = function(ctx) {}

// Exit a parse tree produced by CypherParser#literalIds.
CypherListener.prototype.exitLiteralIds = function(ctx) {}

// Enter a parse tree produced by CypherParser#where.
CypherListener.prototype.enterWhere = function(ctx) {}

// Exit a parse tree produced by CypherParser#where.
CypherListener.prototype.exitWhere = function(ctx) {}

// Enter a parse tree produced by CypherParser#pattern.
CypherListener.prototype.enterPattern = function(ctx) {}

// Exit a parse tree produced by CypherParser#pattern.
CypherListener.prototype.exitPattern = function(ctx) {}

// Enter a parse tree produced by CypherParser#patternPart.
CypherListener.prototype.enterPatternPart = function(ctx) {}

// Exit a parse tree produced by CypherParser#patternPart.
CypherListener.prototype.exitPatternPart = function(ctx) {}

// Enter a parse tree produced by CypherParser#anonymousPatternPart.
CypherListener.prototype.enterAnonymousPatternPart = function(ctx) {}

// Exit a parse tree produced by CypherParser#anonymousPatternPart.
CypherListener.prototype.exitAnonymousPatternPart = function(ctx) {}

// Enter a parse tree produced by CypherParser#patternElement.
CypherListener.prototype.enterPatternElement = function(ctx) {}

// Exit a parse tree produced by CypherParser#patternElement.
CypherListener.prototype.exitPatternElement = function(ctx) {}

// Enter a parse tree produced by CypherParser#nodePattern.
CypherListener.prototype.enterNodePattern = function(ctx) {}

// Exit a parse tree produced by CypherParser#nodePattern.
CypherListener.prototype.exitNodePattern = function(ctx) {}

// Enter a parse tree produced by CypherParser#patternElementChain.
CypherListener.prototype.enterPatternElementChain = function(ctx) {}

// Exit a parse tree produced by CypherParser#patternElementChain.
CypherListener.prototype.exitPatternElementChain = function(ctx) {}

// Enter a parse tree produced by CypherParser#relationshipPattern.
CypherListener.prototype.enterRelationshipPattern = function(ctx) {}

// Exit a parse tree produced by CypherParser#relationshipPattern.
CypherListener.prototype.exitRelationshipPattern = function(ctx) {}

// Enter a parse tree produced by CypherParser#relationshipPatternStart.
CypherListener.prototype.enterRelationshipPatternStart = function(ctx) {}

// Exit a parse tree produced by CypherParser#relationshipPatternStart.
CypherListener.prototype.exitRelationshipPatternStart = function(ctx) {}

// Enter a parse tree produced by CypherParser#relationshipPatternEnd.
CypherListener.prototype.enterRelationshipPatternEnd = function(ctx) {}

// Exit a parse tree produced by CypherParser#relationshipPatternEnd.
CypherListener.prototype.exitRelationshipPatternEnd = function(ctx) {}

// Enter a parse tree produced by CypherParser#relationshipDetail.
CypherListener.prototype.enterRelationshipDetail = function(ctx) {}

// Exit a parse tree produced by CypherParser#relationshipDetail.
CypherListener.prototype.exitRelationshipDetail = function(ctx) {}

// Enter a parse tree produced by CypherParser#properties.
CypherListener.prototype.enterProperties = function(ctx) {}

// Exit a parse tree produced by CypherParser#properties.
CypherListener.prototype.exitProperties = function(ctx) {}

// Enter a parse tree produced by CypherParser#relType.
CypherListener.prototype.enterRelType = function(ctx) {}

// Exit a parse tree produced by CypherParser#relType.
CypherListener.prototype.exitRelType = function(ctx) {}

// Enter a parse tree produced by CypherParser#relationshipTypes.
CypherListener.prototype.enterRelationshipTypes = function(ctx) {}

// Exit a parse tree produced by CypherParser#relationshipTypes.
CypherListener.prototype.exitRelationshipTypes = function(ctx) {}

// Enter a parse tree produced by CypherParser#relationshipType.
CypherListener.prototype.enterRelationshipType = function(ctx) {}

// Exit a parse tree produced by CypherParser#relationshipType.
CypherListener.prototype.exitRelationshipType = function(ctx) {}

// Enter a parse tree produced by CypherParser#relationshipTypeOptionalColon.
CypherListener.prototype.enterRelationshipTypeOptionalColon = function(ctx) {}

// Exit a parse tree produced by CypherParser#relationshipTypeOptionalColon.
CypherListener.prototype.exitRelationshipTypeOptionalColon = function(ctx) {}

// Enter a parse tree produced by CypherParser#nodeLabels.
CypherListener.prototype.enterNodeLabels = function(ctx) {}

// Exit a parse tree produced by CypherParser#nodeLabels.
CypherListener.prototype.exitNodeLabels = function(ctx) {}

// Enter a parse tree produced by CypherParser#nodeLabel.
CypherListener.prototype.enterNodeLabel = function(ctx) {}

// Exit a parse tree produced by CypherParser#nodeLabel.
CypherListener.prototype.exitNodeLabel = function(ctx) {}

// Enter a parse tree produced by CypherParser#rangeLiteral.
CypherListener.prototype.enterRangeLiteral = function(ctx) {}

// Exit a parse tree produced by CypherParser#rangeLiteral.
CypherListener.prototype.exitRangeLiteral = function(ctx) {}

// Enter a parse tree produced by CypherParser#labelName.
CypherListener.prototype.enterLabelName = function(ctx) {}

// Exit a parse tree produced by CypherParser#labelName.
CypherListener.prototype.exitLabelName = function(ctx) {}

// Enter a parse tree produced by CypherParser#relTypeName.
CypherListener.prototype.enterRelTypeName = function(ctx) {}

// Exit a parse tree produced by CypherParser#relTypeName.
CypherListener.prototype.exitRelTypeName = function(ctx) {}

// Enter a parse tree produced by CypherParser#expression.
CypherListener.prototype.enterExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#expression.
CypherListener.prototype.exitExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#orExpression.
CypherListener.prototype.enterOrExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#orExpression.
CypherListener.prototype.exitOrExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#xorExpression.
CypherListener.prototype.enterXorExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#xorExpression.
CypherListener.prototype.exitXorExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#andExpression.
CypherListener.prototype.enterAndExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#andExpression.
CypherListener.prototype.exitAndExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#notExpression.
CypherListener.prototype.enterNotExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#notExpression.
CypherListener.prototype.exitNotExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#comparisonExpression.
CypherListener.prototype.enterComparisonExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#comparisonExpression.
CypherListener.prototype.exitComparisonExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#addOrSubtractExpression.
CypherListener.prototype.enterAddOrSubtractExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#addOrSubtractExpression.
CypherListener.prototype.exitAddOrSubtractExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#multiplyDivideModuloExpression.
CypherListener.prototype.enterMultiplyDivideModuloExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#multiplyDivideModuloExpression.
CypherListener.prototype.exitMultiplyDivideModuloExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#powerOfExpression.
CypherListener.prototype.enterPowerOfExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#powerOfExpression.
CypherListener.prototype.exitPowerOfExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#unaryAddOrSubtractExpression.
CypherListener.prototype.enterUnaryAddOrSubtractExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#unaryAddOrSubtractExpression.
CypherListener.prototype.exitUnaryAddOrSubtractExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#stringListNullOperatorExpression.
CypherListener.prototype.enterStringListNullOperatorExpression = function(
  ctx
) {}

// Exit a parse tree produced by CypherParser#stringListNullOperatorExpression.
CypherListener.prototype.exitStringListNullOperatorExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#propertyOrLabelsExpression.
CypherListener.prototype.enterPropertyOrLabelsExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#propertyOrLabelsExpression.
CypherListener.prototype.exitPropertyOrLabelsExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#filterFunction.
CypherListener.prototype.enterFilterFunction = function(ctx) {}

// Exit a parse tree produced by CypherParser#filterFunction.
CypherListener.prototype.exitFilterFunction = function(ctx) {}

// Enter a parse tree produced by CypherParser#filterFunctionName.
CypherListener.prototype.enterFilterFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#filterFunctionName.
CypherListener.prototype.exitFilterFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#existsFunction.
CypherListener.prototype.enterExistsFunction = function(ctx) {}

// Exit a parse tree produced by CypherParser#existsFunction.
CypherListener.prototype.exitExistsFunction = function(ctx) {}

// Enter a parse tree produced by CypherParser#existsFunctionName.
CypherListener.prototype.enterExistsFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#existsFunctionName.
CypherListener.prototype.exitExistsFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#allFunction.
CypherListener.prototype.enterAllFunction = function(ctx) {}

// Exit a parse tree produced by CypherParser#allFunction.
CypherListener.prototype.exitAllFunction = function(ctx) {}

// Enter a parse tree produced by CypherParser#allFunctionName.
CypherListener.prototype.enterAllFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#allFunctionName.
CypherListener.prototype.exitAllFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#anyFunction.
CypherListener.prototype.enterAnyFunction = function(ctx) {}

// Exit a parse tree produced by CypherParser#anyFunction.
CypherListener.prototype.exitAnyFunction = function(ctx) {}

// Enter a parse tree produced by CypherParser#anyFunctionName.
CypherListener.prototype.enterAnyFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#anyFunctionName.
CypherListener.prototype.exitAnyFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#noneFunction.
CypherListener.prototype.enterNoneFunction = function(ctx) {}

// Exit a parse tree produced by CypherParser#noneFunction.
CypherListener.prototype.exitNoneFunction = function(ctx) {}

// Enter a parse tree produced by CypherParser#noneFunctionName.
CypherListener.prototype.enterNoneFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#noneFunctionName.
CypherListener.prototype.exitNoneFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#singleFunction.
CypherListener.prototype.enterSingleFunction = function(ctx) {}

// Exit a parse tree produced by CypherParser#singleFunction.
CypherListener.prototype.exitSingleFunction = function(ctx) {}

// Enter a parse tree produced by CypherParser#singleFunctionName.
CypherListener.prototype.enterSingleFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#singleFunctionName.
CypherListener.prototype.exitSingleFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#extractFunction.
CypherListener.prototype.enterExtractFunction = function(ctx) {}

// Exit a parse tree produced by CypherParser#extractFunction.
CypherListener.prototype.exitExtractFunction = function(ctx) {}

// Enter a parse tree produced by CypherParser#extractFunctionName.
CypherListener.prototype.enterExtractFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#extractFunctionName.
CypherListener.prototype.exitExtractFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#reduceFunction.
CypherListener.prototype.enterReduceFunction = function(ctx) {}

// Exit a parse tree produced by CypherParser#reduceFunction.
CypherListener.prototype.exitReduceFunction = function(ctx) {}

// Enter a parse tree produced by CypherParser#reduceFunctionName.
CypherListener.prototype.enterReduceFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#reduceFunctionName.
CypherListener.prototype.exitReduceFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#shortestPathPatternFunction.
CypherListener.prototype.enterShortestPathPatternFunction = function(ctx) {}

// Exit a parse tree produced by CypherParser#shortestPathPatternFunction.
CypherListener.prototype.exitShortestPathPatternFunction = function(ctx) {}

// Enter a parse tree produced by CypherParser#shortestPathFunctionName.
CypherListener.prototype.enterShortestPathFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#shortestPathFunctionName.
CypherListener.prototype.exitShortestPathFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#allShortestPathFunctionName.
CypherListener.prototype.enterAllShortestPathFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#allShortestPathFunctionName.
CypherListener.prototype.exitAllShortestPathFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#atom.
CypherListener.prototype.enterAtom = function(ctx) {}

// Exit a parse tree produced by CypherParser#atom.
CypherListener.prototype.exitAtom = function(ctx) {}

// Enter a parse tree produced by CypherParser#literal.
CypherListener.prototype.enterLiteral = function(ctx) {}

// Exit a parse tree produced by CypherParser#literal.
CypherListener.prototype.exitLiteral = function(ctx) {}

// Enter a parse tree produced by CypherParser#stringLiteral.
CypherListener.prototype.enterStringLiteral = function(ctx) {}

// Exit a parse tree produced by CypherParser#stringLiteral.
CypherListener.prototype.exitStringLiteral = function(ctx) {}

// Enter a parse tree produced by CypherParser#booleanLiteral.
CypherListener.prototype.enterBooleanLiteral = function(ctx) {}

// Exit a parse tree produced by CypherParser#booleanLiteral.
CypherListener.prototype.exitBooleanLiteral = function(ctx) {}

// Enter a parse tree produced by CypherParser#listLiteral.
CypherListener.prototype.enterListLiteral = function(ctx) {}

// Exit a parse tree produced by CypherParser#listLiteral.
CypherListener.prototype.exitListLiteral = function(ctx) {}

// Enter a parse tree produced by CypherParser#partialComparisonExpression.
CypherListener.prototype.enterPartialComparisonExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#partialComparisonExpression.
CypherListener.prototype.exitPartialComparisonExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#parenthesizedExpression.
CypherListener.prototype.enterParenthesizedExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#parenthesizedExpression.
CypherListener.prototype.exitParenthesizedExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#relationshipsPattern.
CypherListener.prototype.enterRelationshipsPattern = function(ctx) {}

// Exit a parse tree produced by CypherParser#relationshipsPattern.
CypherListener.prototype.exitRelationshipsPattern = function(ctx) {}

// Enter a parse tree produced by CypherParser#filterExpression.
CypherListener.prototype.enterFilterExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#filterExpression.
CypherListener.prototype.exitFilterExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#idInColl.
CypherListener.prototype.enterIdInColl = function(ctx) {}

// Exit a parse tree produced by CypherParser#idInColl.
CypherListener.prototype.exitIdInColl = function(ctx) {}

// Enter a parse tree produced by CypherParser#functionInvocation.
CypherListener.prototype.enterFunctionInvocation = function(ctx) {}

// Exit a parse tree produced by CypherParser#functionInvocation.
CypherListener.prototype.exitFunctionInvocation = function(ctx) {}

// Enter a parse tree produced by CypherParser#functionInvocationBody.
CypherListener.prototype.enterFunctionInvocationBody = function(ctx) {}

// Exit a parse tree produced by CypherParser#functionInvocationBody.
CypherListener.prototype.exitFunctionInvocationBody = function(ctx) {}

// Enter a parse tree produced by CypherParser#functionName.
CypherListener.prototype.enterFunctionName = function(ctx) {}

// Exit a parse tree produced by CypherParser#functionName.
CypherListener.prototype.exitFunctionName = function(ctx) {}

// Enter a parse tree produced by CypherParser#procedureName.
CypherListener.prototype.enterProcedureName = function(ctx) {}

// Exit a parse tree produced by CypherParser#procedureName.
CypherListener.prototype.exitProcedureName = function(ctx) {}

// Enter a parse tree produced by CypherParser#listComprehension.
CypherListener.prototype.enterListComprehension = function(ctx) {}

// Exit a parse tree produced by CypherParser#listComprehension.
CypherListener.prototype.exitListComprehension = function(ctx) {}

// Enter a parse tree produced by CypherParser#patternComprehension.
CypherListener.prototype.enterPatternComprehension = function(ctx) {}

// Exit a parse tree produced by CypherParser#patternComprehension.
CypherListener.prototype.exitPatternComprehension = function(ctx) {}

// Enter a parse tree produced by CypherParser#propertyLookup.
CypherListener.prototype.enterPropertyLookup = function(ctx) {}

// Exit a parse tree produced by CypherParser#propertyLookup.
CypherListener.prototype.exitPropertyLookup = function(ctx) {}

// Enter a parse tree produced by CypherParser#caseExpression.
CypherListener.prototype.enterCaseExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#caseExpression.
CypherListener.prototype.exitCaseExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#caseAlternatives.
CypherListener.prototype.enterCaseAlternatives = function(ctx) {}

// Exit a parse tree produced by CypherParser#caseAlternatives.
CypherListener.prototype.exitCaseAlternatives = function(ctx) {}

// Enter a parse tree produced by CypherParser#variable.
CypherListener.prototype.enterVariable = function(ctx) {}

// Exit a parse tree produced by CypherParser#variable.
CypherListener.prototype.exitVariable = function(ctx) {}

// Enter a parse tree produced by CypherParser#numberLiteral.
CypherListener.prototype.enterNumberLiteral = function(ctx) {}

// Exit a parse tree produced by CypherParser#numberLiteral.
CypherListener.prototype.exitNumberLiteral = function(ctx) {}

// Enter a parse tree produced by CypherParser#mapLiteral.
CypherListener.prototype.enterMapLiteral = function(ctx) {}

// Exit a parse tree produced by CypherParser#mapLiteral.
CypherListener.prototype.exitMapLiteral = function(ctx) {}

// Enter a parse tree produced by CypherParser#mapProjection.
CypherListener.prototype.enterMapProjection = function(ctx) {}

// Exit a parse tree produced by CypherParser#mapProjection.
CypherListener.prototype.exitMapProjection = function(ctx) {}

// Enter a parse tree produced by CypherParser#mapProjectionVariants.
CypherListener.prototype.enterMapProjectionVariants = function(ctx) {}

// Exit a parse tree produced by CypherParser#mapProjectionVariants.
CypherListener.prototype.exitMapProjectionVariants = function(ctx) {}

// Enter a parse tree produced by CypherParser#literalEntry.
CypherListener.prototype.enterLiteralEntry = function(ctx) {}

// Exit a parse tree produced by CypherParser#literalEntry.
CypherListener.prototype.exitLiteralEntry = function(ctx) {}

// Enter a parse tree produced by CypherParser#propertySelector.
CypherListener.prototype.enterPropertySelector = function(ctx) {}

// Exit a parse tree produced by CypherParser#propertySelector.
CypherListener.prototype.exitPropertySelector = function(ctx) {}

// Enter a parse tree produced by CypherParser#variableSelector.
CypherListener.prototype.enterVariableSelector = function(ctx) {}

// Exit a parse tree produced by CypherParser#variableSelector.
CypherListener.prototype.exitVariableSelector = function(ctx) {}

// Enter a parse tree produced by CypherParser#allPropertiesSelector.
CypherListener.prototype.enterAllPropertiesSelector = function(ctx) {}

// Exit a parse tree produced by CypherParser#allPropertiesSelector.
CypherListener.prototype.exitAllPropertiesSelector = function(ctx) {}

// Enter a parse tree produced by CypherParser#parameter.
CypherListener.prototype.enterParameter = function(ctx) {}

// Exit a parse tree produced by CypherParser#parameter.
CypherListener.prototype.exitParameter = function(ctx) {}

// Enter a parse tree produced by CypherParser#legacyParameter.
CypherListener.prototype.enterLegacyParameter = function(ctx) {}

// Exit a parse tree produced by CypherParser#legacyParameter.
CypherListener.prototype.exitLegacyParameter = function(ctx) {}

// Enter a parse tree produced by CypherParser#newParameter.
CypherListener.prototype.enterNewParameter = function(ctx) {}

// Exit a parse tree produced by CypherParser#newParameter.
CypherListener.prototype.exitNewParameter = function(ctx) {}

// Enter a parse tree produced by CypherParser#parameterName.
CypherListener.prototype.enterParameterName = function(ctx) {}

// Exit a parse tree produced by CypherParser#parameterName.
CypherListener.prototype.exitParameterName = function(ctx) {}

// Enter a parse tree produced by CypherParser#propertyExpressions.
CypherListener.prototype.enterPropertyExpressions = function(ctx) {}

// Exit a parse tree produced by CypherParser#propertyExpressions.
CypherListener.prototype.exitPropertyExpressions = function(ctx) {}

// Enter a parse tree produced by CypherParser#propertyExpression.
CypherListener.prototype.enterPropertyExpression = function(ctx) {}

// Exit a parse tree produced by CypherParser#propertyExpression.
CypherListener.prototype.exitPropertyExpression = function(ctx) {}

// Enter a parse tree produced by CypherParser#propertyKeys.
CypherListener.prototype.enterPropertyKeys = function(ctx) {}

// Exit a parse tree produced by CypherParser#propertyKeys.
CypherListener.prototype.exitPropertyKeys = function(ctx) {}

// Enter a parse tree produced by CypherParser#propertyKeyName.
CypherListener.prototype.enterPropertyKeyName = function(ctx) {}

// Exit a parse tree produced by CypherParser#propertyKeyName.
CypherListener.prototype.exitPropertyKeyName = function(ctx) {}

// Enter a parse tree produced by CypherParser#integerLiteral.
CypherListener.prototype.enterIntegerLiteral = function(ctx) {}

// Exit a parse tree produced by CypherParser#integerLiteral.
CypherListener.prototype.exitIntegerLiteral = function(ctx) {}

// Enter a parse tree produced by CypherParser#doubleLiteral.
CypherListener.prototype.enterDoubleLiteral = function(ctx) {}

// Exit a parse tree produced by CypherParser#doubleLiteral.
CypherListener.prototype.exitDoubleLiteral = function(ctx) {}

// Enter a parse tree produced by CypherParser#namespace.
CypherListener.prototype.enterNamespace = function(ctx) {}

// Exit a parse tree produced by CypherParser#namespace.
CypherListener.prototype.exitNamespace = function(ctx) {}

// Enter a parse tree produced by CypherParser#leftArrowHead.
CypherListener.prototype.enterLeftArrowHead = function(ctx) {}

// Exit a parse tree produced by CypherParser#leftArrowHead.
CypherListener.prototype.exitLeftArrowHead = function(ctx) {}

// Enter a parse tree produced by CypherParser#rightArrowHead.
CypherListener.prototype.enterRightArrowHead = function(ctx) {}

// Exit a parse tree produced by CypherParser#rightArrowHead.
CypherListener.prototype.exitRightArrowHead = function(ctx) {}

// Enter a parse tree produced by CypherParser#dash.
CypherListener.prototype.enterDash = function(ctx) {}

// Exit a parse tree produced by CypherParser#dash.
CypherListener.prototype.exitDash = function(ctx) {}

// Enter a parse tree produced by CypherParser#symbolicName.
CypherListener.prototype.enterSymbolicName = function(ctx) {}

// Exit a parse tree produced by CypherParser#symbolicName.
CypherListener.prototype.exitSymbolicName = function(ctx) {}

// Enter a parse tree produced by CypherParser#keyword.
CypherListener.prototype.enterKeyword = function(ctx) {}

// Exit a parse tree produced by CypherParser#keyword.
CypherListener.prototype.exitKeyword = function(ctx) {}

exports.CypherListener = CypherListener

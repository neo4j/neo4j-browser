/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { useDispatch, useSelector } from 'react-redux'
import { Icons } from 'browser/components/icons'
import { ErrorBoundary } from 'react-error-boundary'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { AppDispatch } from 'shared/store/configureStore'
import { AnyAction } from '@reduxjs/toolkit'

import { errorMessageFormater } from '../../errorMessageFormater'
import {
  StyledCypherErrorMessage,
  StyledDiv,
  StyledErrorH4,
  StyledHelpContent,
  StyledHelpDescription,
  StyledHelpFrame,
  StyledLink,
  StyledLinkContainer,
  StyledPreformattedArea
} from '../../styled'
import { MissingParamsTemplateLink } from './MissingParamsTemplateLink'
import {
  commandSources,
  executeCommand,
  listDbsCommand
} from 'shared/modules/commands/commandsDuck'
import { getListProcedureQuery } from 'shared/modules/cypher/functionsAndProceduresHelper'
import * as editor from 'shared/modules/editor/editorDuck'
import { getParams } from 'shared/modules/params/paramsDuck'
import { BrowserRequestResult } from 'shared/modules/requests/requestsDuck'
import { GENERATE_SET_MISSING_PARAMS_TEMPLATE } from 'shared/modules/udc/udcDuck'
import {
  isImplicitTransactionError,
  isNoDbAccessError,
  isParameterMissingError,
  isUnknownProcedureError
} from 'services/cypherErrorsHelper'
import { BrowserError } from 'services/exceptions'
import { getSemanticVersion } from 'shared/modules/dbMeta/dbMetaDuck'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md"
  >
    <h2 className="text-red-700 dark:text-red-300">Something went wrong:</h2>
    <pre className="mt-2 text-sm">{error.message}</pre>
    <button
      onClick={resetErrorBoundary}
      className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 rounded-md"
    >
      Try again
    </button>
  </motion.div>
)

interface LoadingStateProps {
  message?: string
}

const LoadingState = ({ message = 'Loading...' }: LoadingStateProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center space-x-2 p-4"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Icons.Loader className="w-5 h-5 text-primary" />
    </motion.div>
    <span>{message}</span>
  </motion.div>
)

interface ErrorsViewProps {
  result: BrowserRequestResult
  params?: Record<string, unknown>
}

export function ErrorsView({ result }: ErrorsViewProps) {
  const dispatch = useDispatch<AppDispatch>()
  const params = useSelector(getParams)
  const neo4jVersion = useSelector(getSemanticVersion)
  const [isLoading, setIsLoading] = useState(false)

  const error = result as BrowserError
  if (!error || !error.code) {
    return null
  }

  const fullError = errorMessageFormater(null, error.message)

  const handleError = (err: unknown) => {
    console.error(err)
    // Handle error appropriately
  }

  const executeCmd = async (cmd: string) => {
    try {
      setIsLoading(true)
      await dispatch(executeCommand(cmd, { source: commandSources.button }) as unknown as AnyAction)
    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const setEditorContent = (cmd: string) => {
    dispatch(editor.setContent(cmd))
  }

  const handleSetMissingParamsTemplateHelpMessageClick = () => {
    dispatch({ type: GENERATE_SET_MISSING_PARAMS_TEMPLATE })
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setIsLoading(false)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingState />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <StyledHelpFrame>
              <StyledHelpContent>
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <StyledHelpDescription>
                    <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
                    <StyledErrorH4>{error.code}</StyledErrorH4>
                  </StyledHelpDescription>
                </motion.div>

                <StyledDiv>
                  <StyledPreformattedArea data-testid="cypherFrameErrorMessage">
                    {fullError.message}
                  </StyledPreformattedArea>
                </StyledDiv>

                <motion.div layout>
                  {isUnknownProcedureError(error) && (
                    <StyledLinkContainer>
                      <StyledLink onClick={() => executeCmd(getListProcedureQuery(neo4jVersion))}>
                        <Icons.Play className="icon icon-sm" />
                        &nbsp;List available procedures
                      </StyledLink>
                    </StyledLinkContainer>
                  )}
                  {isNoDbAccessError(error) && (
                    <StyledLinkContainer>
                      <StyledLink onClick={() => executeCmd(`:${listDbsCommand}`)}>
                        <Icons.Play className="icon icon-sm" />
                        &nbsp;List available databases
                      </StyledLink>
                    </StyledLinkContainer>
                  )}
                  {isImplicitTransactionError(error) && (
                    <StyledLinkContainer>
                      <StyledLink onClick={() => executeCmd(`:help auto`)}>
                        <Icons.Play className="icon icon-sm" />
                        &nbsp;Info on the <code>:auto</code> command
                      </StyledLink>
                      &nbsp;(auto-committing transactions)
                    </StyledLinkContainer>
                  )}
                  {isParameterMissingError(error) && (
                    <MissingParamsTemplateLink
                      error={error}
                      params={params}
                      setEditorContent={setEditorContent}
                      onTemplateHelpMessageClick={handleSetMissingParamsTemplateHelpMessageClick}
                    />
                  )}
                </motion.div>
              </StyledHelpContent>
            </StyledHelpFrame>
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  )
}

export default ErrorsView

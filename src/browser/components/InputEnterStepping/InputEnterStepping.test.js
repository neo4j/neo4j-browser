/* global jest */

import React from 'react'
import { render, Simulate } from 'react-testing-library'

import InputEnterStepping from './InputEnterStepping'

test('renders the render prop', () => {
  // When
  const { container } = render(
    <InputEnterStepping
      render={() => {
        return <div>hello</div>
      }}
    />
  )

  // Then
  expect(container).toMatchSnapshot()
})

test('submits on enter in last input', async () => {
  // Given
  const myFn = jest.fn()

  // When
  const { container, getByTestId } = render(
    <InputEnterStepping
      submitAction={myFn}
      render={({ getInputPropsForIndex, setRefForIndex }) => {
        return (
          <React.Fragment>
            <input
              {...getInputPropsForIndex(0, {
                'data-testid': 'first',
                defaultValue: 'first',
                ref: ref => setRefForIndex(0, ref)
              })}
            />
            <input
              {...getInputPropsForIndex(1, {
                'data-testid': 'second',
                defaultValue: 'second',
                ref: ref => setRefForIndex(1, ref)
              })}
            />
          </React.Fragment>
        )
      }}
    />
  )

  // Then
  expect(container).toMatchSnapshot()

  // When
  // Enter in first should focus second
  Simulate.keyDown(getByTestId('first'), {
    key: 'Enter',
    keyCode: 13,
    which: 13
  })

  // Then
  expect(myFn).toHaveBeenCalledTimes(0)

  // When
  // Enter in last should submit
  Simulate.keyDown(getByTestId('second'), {
    key: 'Enter',
    keyCode: 13,
    which: 13
  })

  // Then
  expect(myFn).toHaveBeenCalledTimes(1)
})

test('submits on button click', async () => {
  // Given
  const myFn = jest.fn()

  // When
  const { container, getByText } = render(
    <InputEnterStepping
      submitAction={myFn}
      render={({ getInputPropsForIndex, getSubmitProps, setRefForIndex }) => {
        return (
          <React.Fragment>
            <input
              {...getInputPropsForIndex(0, {
                'data-testid': 'first',
                defaultValue: 'first',
                ref: ref => setRefForIndex(0, ref)
              })}
            />
            <input
              {...getInputPropsForIndex(1, {
                'data-testid': 'second',
                defaultValue: 'second',
                ref: ref => setRefForIndex(1, ref)
              })}
            />
            <button {...getSubmitProps()}>Send</button>
          </React.Fragment>
        )
      }}
    />
  )

  // Then
  expect(container).toMatchSnapshot()
  expect(myFn).toHaveBeenCalledTimes(0)

  // When
  // Click button!
  Simulate.click(getByText('Send'))

  // Then
  expect(myFn).toHaveBeenCalledTimes(1)
})

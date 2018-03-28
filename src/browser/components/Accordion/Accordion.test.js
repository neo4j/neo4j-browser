import { componentMount, mount } from 'services/testUtils'
import Accordion from './Accordion'

describe('<Accordion>', () => {
  test('does not open any content by default', () => {
    // Given
    const render = ({ getChildProps }) => {
      const p0 = getChildProps({ index: 0 })
      const p1 = getChildProps({ index: 1 })
      return (
        <div>
          <Accordion.Title {...p0.titleProps}>First</Accordion.Title>
          <Accordion.Content {...p0.contentProps}>
            First Content
          </Accordion.Content>
          <Accordion.Title {...p1.titleProps}>Second</Accordion.Title>
          <Accordion.Content {...p1.contentProps}>
            Second Content
          </Accordion.Content>
        </div>
      )
    }

    // When
    const result = mount(Accordion, { render })
      .then(wrapper => wrapper)
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual('FirstSecond')
      })

    // Return test result (promise)
    return result
  })

  test('toggles content on title click', () => {
    // Given
    const render = ({ getChildProps }) => {
      const p0 = getChildProps({ index: 0 })
      const p1 = getChildProps({ index: 1 })
      return (
        <div>
          <Accordion.Title {...p0.titleProps}>First</Accordion.Title>
          <Accordion.Content {...p0.contentProps}>
            First Content
          </Accordion.Content>
          <Accordion.Title {...p1.titleProps}>Second</Accordion.Title>
          <Accordion.Content {...p1.contentProps}>
            Second Content
          </Accordion.Content>
        </div>
      )
    }
    // When
    const result = componentMount(<Accordion render={render} />)
      .then(wrapper => wrapper)
      // Then
      .then(wrapper => {
        const inst = wrapper.instance()
        inst.titleClick(0) // Click first title
        wrapper.update()
        expect(wrapper.text()).toEqual('FirstFirst ContentSecond')
        return wrapper
      })
      .then(wrapper => {
        const inst = wrapper.instance()
        inst.titleClick(1) // Click second title
        wrapper.update()
        expect(wrapper.text()).toEqual('FirstSecondSecond Content')
        return wrapper
      })
      .then(wrapper => {
        const inst = wrapper.instance()
        inst.titleClick(1) // Click second title again = close
        wrapper.update()
        expect(wrapper.text()).toEqual('FirstSecond')
        return wrapper
      })

    // Return test result (promise)
    return result
  })

  test('can have content panes open by default and works as usual after that', () => {
    // Given
    let p0Click, p1Click
    const render = ({ getChildProps }) => {
      const p0 = getChildProps({ index: 0, defaultActive: true })
      const p1 = getChildProps({ index: 1 })
      const p2 = getChildProps({ index: 2, defaultActive: true })
      p0Click = p0.titleProps.onClick
      p1Click = p1.titleProps.onClick
      return (
        <div>
          <Accordion.Title {...p0.titleProps}>First</Accordion.Title>
          <Accordion.Content {...p0.contentProps}>
            First Content
          </Accordion.Content>
          <Accordion.Title {...p1.titleProps}>Second</Accordion.Title>
          <Accordion.Content {...p1.contentProps}>
            Second Content
          </Accordion.Content>
          <Accordion.Title {...p2.titleProps}>Third</Accordion.Title>
          <Accordion.Content {...p2.contentProps}>
            Third Content
          </Accordion.Content>
        </div>
      )
    }

    // When
    const result = mount(Accordion, { render })
      .then(wrapper => wrapper)
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual(
          'FirstFirst ContentSecondThirdThird Content'
        )
        return wrapper
      })
      .then(wrapper => {
        // Click an open title closes the default opened
        p0Click()
        wrapper.update()
        expect(wrapper.text()).toEqual('FirstSecondThird')
        return wrapper
      })
      .then(wrapper => {
        // Click a title opens it
        p1Click()
        wrapper.update()
        expect(wrapper.text()).toEqual('FirstSecondSecond ContentThird')
        return wrapper
      })

    // Return test result (promise)
    return result
  })

  test('can have content panes always open', () => {
    // Given
    let p1Click, p0Click
    const render = ({ getChildProps }) => {
      const p0 = getChildProps({ index: 0, forceActive: true })
      const p1 = getChildProps({ index: 1 })
      const p2 = getChildProps({ index: 2, forceActive: true })
      p0Click = p0.titleProps.onClick
      p1Click = p1.titleProps.onClick
      return (
        <div>
          <Accordion.Title {...p0.titleProps}>First</Accordion.Title>
          <Accordion.Content {...p0.contentProps}>
            First Content
          </Accordion.Content>
          <Accordion.Title {...p1.titleProps}>Second</Accordion.Title>
          <Accordion.Content {...p1.contentProps}>
            Second Content
          </Accordion.Content>
          <Accordion.Title {...p2.titleProps}>Third</Accordion.Title>
          <Accordion.Content {...p2.contentProps}>
            Third Content
          </Accordion.Content>
        </div>
      )
    }

    // When
    const result = mount(Accordion, { render })
      .then(wrapper => wrapper)
      // Then
      .then(wrapper => {
        expect(wrapper.text()).toEqual(
          'FirstFirst ContentSecondThirdThird Content'
        )
        return wrapper
      })
      .then(wrapper => {
        // Click a closed title does not close the forced opened
        p1Click()
        wrapper.update()
        expect(wrapper.text()).toEqual(
          'FirstFirst ContentSecondSecond ContentThirdThird Content'
        )
        return wrapper
      })
      .then(wrapper => {
        // Click a forced opened does not do anything
        p0Click()
        wrapper.update()
        expect(wrapper.text()).toEqual(
          'FirstFirst ContentSecondSecond ContentThirdThird Content'
        )
        return wrapper
      })
      .then(wrapper => {
        // Click a open non-forced opened closes itself
        p1Click()
        wrapper.update()
        expect(wrapper.text()).toEqual(
          'FirstFirst ContentSecondThirdThird Content'
        )
        return wrapper
      })

    // Return test result (promise)
    return result
  })
})

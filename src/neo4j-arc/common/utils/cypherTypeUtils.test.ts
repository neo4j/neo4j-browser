import {
  Date,
  DateTime,
  Duration,
  int,
  LocalDateTime,
  LocalTime,
  Node,
  Path,
  PathSegment,
  Point,
  Relationship,
  Time
} from 'neo4j-driver'
import { cypherDataToString, propertyToString } from './cypherTypeUtils'

describe('propertyToString', () => {
  test('basic property types', () => {
    expect(propertyToString(true)).toEqual('true')
    expect(propertyToString(false)).toEqual('false')
    expect(propertyToString(null)).toEqual('null')

    // integers and floats
    expect(propertyToString(int(3))).toEqual('3')
    expect(propertyToString(int(-1))).toEqual('-1')
    expect(propertyToString(1)).toEqual('1.0')
    expect(propertyToString(-123)).toEqual('-123.0')

    expect(propertyToString([12, 34])).toEqual('[12.0, 34.0]')

    expect(propertyToString(new Point(int(1), 3, 4))).toEqual(
      'point({srid:1, x:3, y:4})'
    )

    expect(
      propertyToString(new Duration(int(124), int(0), int(0), int(0)))
    ).toEqual('P124M0DT0S')

    expect(
      propertyToString(
        new DateTime(
          int(2003),
          int(3),
          int(3),
          int(3),
          int(3),
          int(3),
          int(3),
          int(0)
        )
      )
    ).toEqual('2003-03-03T03:03:03.000000003Z')

    expect(propertyToString(new Date(int(2003), int(12), int(25)))).toEqual(
      '2003-12-25'
    )

    expect(
      propertyToString(new Time(int(23), int(12), int(25), int(0), int(0)))
    ).toEqual('23:12:25Z')

    expect(
      propertyToString(new Time(int(23), int(12), int(25), int(0), int(10)))
    ).toEqual('23:12:25+00:00:10')

    expect(
      propertyToString(new LocalTime(int(23), int(12), int(25), int(0)))
    ).toEqual('23:12:25')

    expect(
      propertyToString(
        new LocalDateTime(
          int(2003),
          int(12),
          int(25),
          int(23),
          int(12),
          int(25),
          int(0)
        )
      )
    ).toEqual('2003-12-25T23:12:25')

    expect(propertyToString([12, 34])).toEqual('[12.0, 34.0]')

    expect(propertyToString('Mothim')).toEqual('"Mothim"')
    expect(propertyToString('💎')).toEqual('"💎"')
  })
})

describe('cypherDataToString', () => {
  test('test cypher maps', () => {
    expect(
      cypherDataToString({
        hoenn: 'kabuto',
        johto: 'mew'
      })
    ).toEqual(`{
  hoenn: "kabuto",
  johto: "mew"
}`)

    expect(
      cypherDataToString({
        regions: {
          hoenn: 'kabuto',
          johto: 'mew'
        }
      })
    ).toEqual(`{
  regions: {
    hoenn: "kabuto",
    johto: "mew"
  }
}`)

    expect(
      cypherDataToString({
        regions: {
          hoenn: {
            slateport: {
              pos: new Point(int(1), 3, 4),
              inhabitants: int(1200),
              gymLeader: 'Wattson'
            },
            rustboro: {
              pos: new Point(int(1), 17, 6),
              inhabitants: int(4010),
              gymLeader: 'Roxanne'
            }
          }
        }
      })
    ).toEqual(`{
  regions: {
    hoenn: {
      slateport: {
        pos: point({srid:1, x:3, y:4}),
        inhabitants: 1200,
        gymLeader: "Wattson"
      },
      rustboro: {
        pos: point({srid:1, x:17, y:6}),
        inhabitants: 4010,
        gymLeader: "Roxanne"
      }
    }
  }
}`)
  })

  test('test complex cypher list', () => {
    expect(cypherDataToString([{}, {}, { a: [{}] }])).toEqual(`[
  {},
  {},
  {
    a: [
      {}
    ]
  }
]`)

    expect(
      cypherDataToString([
        {
          regions: { b: [{ test: 3, test3: 4 }] }
        },
        { a: 3 }
      ])
    ).toEqual(
      `[
  {
    regions: {
      b: [
        {
          test: 3.0,
          test3: 4.0
        }
      ]
    }
  },
  {
    a: 3.0
  }
]`
    )
  })

  test('nodes, relationships and paths', () => {
    const startNode = new Node(int(1), ['Person'], {
      prop1: 'prop1'
    })
    const endNode = new Node(int(2), ['Movie'], {
      prop2: 'prop2'
    })
    const relationship = new Relationship(
      int(3),
      startNode.identity,
      endNode.identity,
      'ACTED_IN',
      {}
    )
    const pathSegment = new PathSegment(startNode, relationship, endNode)
    const path = new Path(startNode, endNode, [pathSegment])

    expect(cypherDataToString(startNode)).toEqual(`{
  identity: 1,
  labels: ["Person"],
  properties: {
    prop1: "prop1"
  }
}`)

    expect(cypherDataToString(relationship)).toEqual(`{
  identity: 3,
  start: 1,
  end: 2,
  type: "ACTED_IN",
  properties: {}
}`)

    expect(cypherDataToString(path)).toEqual(
      `{
  start: {
    identity: 1,
    labels: ["Person"],
    properties: {
      prop1: "prop1"
    }
  },
  end: {
    identity: 2,
    labels: ["Movie"],
    properties: {
      prop2: "prop2"
    }
  },
  segments: [
    {
      start: {
        identity: 1,
        labels: ["Person"],
        properties: {
          prop1: "prop1"
        }
      },
      relationship: {
        identity: 3,
        start: 1,
        end: 2,
        type: "ACTED_IN",
        properties: {}
      },
      end: {
        identity: 2,
        labels: ["Movie"],
        properties: {
          prop2: "prop2"
        }
      }
    }
  ],
  length: 1.0
}`
    )
  })
})

import { cleanUdcFromStorage, initialState } from './udcDuck'

describe('loads from localstorage', () => {
  it('handles missing stored data', () => {
    expect(cleanUdcFromStorage(undefined)).toEqual(initialState)
  })
  it('handles incorrect stored data types', () => {
    expect(cleanUdcFromStorage([] as any)).toEqual(initialState)
    expect(cleanUdcFromStorage('string' as any)).toEqual(initialState)
  })
  it('handles wrongly stored data', () => {
    expect(
      cleanUdcFromStorage({
        lastSnapshot: {},
        auraNtId: {},
        uuid: [],
        consentBannerShownCount: 'five',
        desktopTrackingId: 34,
        allowUserStatsInDesktop: true,
        allowCrashReportsInDesktop: undefined
      } as any)
    ).toEqual({ ...initialState, allowUserStatsInDesktop: true })
  })

  it('handles proper stored data', () => {
    const state = {
      lastSnapshot: 10,
      auraNtId: 'tes3t',
      uuid: 'a',
      consentBannerShownCount: 3,
      desktopTrackingId: 'sb',
      allowUserStatsInDesktop: true,
      allowCrashReportsInDesktop: true
    }

    expect(cleanUdcFromStorage(initialState)).toEqual(initialState)
    expect(cleanUdcFromStorage(state)).toEqual(state)
  })

  it('handle a real life store', () => {
    const test = {
      uuid: '262e82d0-52da-433b-9e7f-3896d406f1a7',
      created_at: 1561625538,
      client_starts: 270,
      cypher_attempts: 4809,
      cypher_wins: 5680,
      cypher_fails: 1035,
      pingTime: 0,
      events: [
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 204,
            cypher_attempts: 4673,
            cypher_wins: 3869,
            cypher_fails: 730
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 205,
            cypher_attempts: 4676,
            cypher_wins: 3871,
            cypher_fails: 731
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 205,
            cypher_attempts: 4677,
            cypher_wins: 3871,
            cypher_fails: 732
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 205,
            cypher_attempts: 4678,
            cypher_wins: 3871,
            cypher_fails: 733
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 205,
            cypher_attempts: 4679,
            cypher_wins: 3871,
            cypher_fails: 734
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 206,
            cypher_attempts: 4680,
            cypher_wins: 3872,
            cypher_fails: 734
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 207,
            cypher_attempts: 4681,
            cypher_wins: 3873,
            cypher_fails: 734
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 208,
            cypher_attempts: 4717,
            cypher_wins: 3903,
            cypher_fails: 740
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 208,
            cypher_attempts: 4777,
            cypher_wins: 3959,
            cypher_fails: 744
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 209,
            cypher_wins: 3988,
            cypher_fails: 746
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 210,
            cypher_wins: 3990,
            cypher_fails: 746
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 211,
            cypher_wins: 4031,
            cypher_fails: 759
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 212,
            cypher_wins: 4032,
            cypher_fails: 760
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 212,
            cypher_wins: 4032,
            cypher_fails: 760
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 213,
            cypher_wins: 4035,
            cypher_fails: 760
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 214,
            cypher_wins: 4036,
            cypher_fails: 760
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 215,
            cypher_wins: 4054,
            cypher_fails: 762
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 216,
            cypher_wins: 4056,
            cypher_fails: 763
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 217,
            cypher_wins: 4105,
            cypher_fails: 773
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 218,
            cypher_wins: 4154,
            cypher_fails: 777
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 218,
            cypher_wins: 4155,
            cypher_fails: 777
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 218,
            cypher_wins: 4156,
            cypher_fails: 778
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 219,
            cypher_wins: 4225,
            cypher_fails: 784
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 220,
            cypher_wins: 4230,
            cypher_fails: 784
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 221,
            cypher_wins: 4234,
            cypher_fails: 784
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 222,
            cypher_wins: 4235,
            cypher_fails: 784
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 223,
            cypher_wins: 4235,
            cypher_fails: 784
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 224,
            cypher_wins: 4236,
            cypher_fails: 784
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 225,
            cypher_wins: 4236,
            cypher_fails: 784
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 226,
            cypher_wins: 4243,
            cypher_fails: 785
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 227,
            cypher_wins: 4243,
            cypher_fails: 785
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 228,
            cypher_wins: 4248,
            cypher_fails: 785
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 229,
            cypher_wins: 4248,
            cypher_fails: 785
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 230,
            cypher_wins: 4295,
            cypher_fails: 787
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 231,
            cypher_wins: 4309,
            cypher_fails: 787
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 232,
            cypher_wins: 4318,
            cypher_fails: 788
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 233,
            cypher_wins: 4329,
            cypher_fails: 792
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 233,
            cypher_wins: 4368,
            cypher_fails: 798
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 234,
            cypher_wins: 4374,
            cypher_fails: 798
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 234,
            cypher_wins: 4438,
            cypher_fails: 801
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 235,
            cypher_wins: 4460,
            cypher_fails: 801
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 236,
            cypher_wins: 4461,
            cypher_fails: 801
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 237,
            cypher_wins: 4462,
            cypher_fails: 802
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 237,
            cypher_wins: 4490,
            cypher_fails: 805
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 237,
            cypher_wins: 4490,
            cypher_fails: 805
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 238,
            cypher_wins: 4490,
            cypher_fails: 805
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 238,
            cypher_wins: 4491,
            cypher_fails: 806
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 238,
            cypher_wins: 4492,
            cypher_fails: 806
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 238,
            cypher_wins: 4492,
            cypher_fails: 806
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 239,
            cypher_wins: 4499,
            cypher_fails: 806
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 239,
            cypher_wins: 4534,
            cypher_fails: 817
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 240,
            cypher_wins: 4535,
            cypher_fails: 817
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 240,
            cypher_wins: 4560,
            cypher_fails: 820
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 241,
            cypher_wins: 4560,
            cypher_fails: 820
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 242,
            cypher_wins: 4614,
            cypher_fails: 827
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 242,
            cypher_wins: 4642,
            cypher_fails: 829
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 242,
            cypher_wins: 4652,
            cypher_fails: 830
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 242,
            cypher_wins: 4652,
            cypher_fails: 830
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 243,
            cypher_wins: 4654,
            cypher_fails: 830
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 244,
            cypher_wins: 4658,
            cypher_fails: 832
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 245,
            cypher_wins: 4658,
            cypher_fails: 833
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 246,
            cypher_wins: 4684,
            cypher_fails: 834
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 247,
            cypher_wins: 4687,
            cypher_fails: 834
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 248,
            cypher_wins: 4689,
            cypher_fails: 834
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 248,
            cypher_wins: 4747,
            cypher_fails: 846
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 248,
            cypher_wins: 4749,
            cypher_fails: 846
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 249,
            cypher_wins: 4749,
            cypher_fails: 846
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: '4.0.0-alpha01',
            client_starts: 250,
            cypher_wins: 4750,
            cypher_fails: 846
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 251,
            cypher_wins: 4760,
            cypher_fails: 846
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 252,
            cypher_wins: 4765,
            cypher_fails: 846
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 253,
            cypher_wins: 4821,
            cypher_fails: 865
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 254,
            cypher_wins: 4822,
            cypher_fails: 865
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 255,
            cypher_wins: 4823,
            cypher_fails: 865
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 256,
            cypher_wins: 4823,
            cypher_fails: 865
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 257,
            cypher_wins: 4833,
            cypher_fails: 867
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 258,
            cypher_wins: 4932,
            cypher_fails: 884
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 259,
            cypher_wins: 4981,
            cypher_fails: 902
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 260,
            cypher_wins: 4995,
            cypher_fails: 902
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 261,
            cypher_wins: 5182,
            cypher_fails: 911
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 262,
            cypher_wins: 5184,
            cypher_fails: 911
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 262,
            cypher_wins: 5185,
            cypher_fails: 911
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 263,
            cypher_wins: 5196,
            cypher_fails: 913
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 263,
            cypher_wins: 5222,
            cypher_fails: 916
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 263,
            cypher_wins: 5222,
            cypher_fails: 916
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 263,
            cypher_wins: 5314,
            cypher_fails: 919
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 263,
            cypher_wins: 5314,
            cypher_fails: 919
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 263,
            cypher_wins: 5319,
            cypher_fails: 925
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 263,
            cypher_wins: 5319,
            cypher_fails: 925
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 263,
            cypher_wins: 5320,
            cypher_fails: 925
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 263,
            cypher_wins: 5320,
            cypher_fails: 925
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 264,
            cypher_wins: 5320,
            cypher_fails: 925
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 264,
            cypher_wins: 5320,
            cypher_fails: 925
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 264,
            cypher_wins: 5368,
            cypher_fails: 929
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 265,
            cypher_wins: 5369,
            cypher_fails: 929
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 266,
            cypher_wins: 5535,
            cypher_fails: 1013
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 267,
            cypher_wins: 5573,
            cypher_fails: 1018
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 268,
            cypher_wins: 5647,
            cypher_fails: 1023
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 269,
            cypher_wins: 5652,
            cypher_fails: 1026
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 270,
            cypher_wins: 5652,
            cypher_fails: 1026
          }
        },
        {
          name: 'connect',
          data: {
            neo4j_version: null,
            client_starts: 270,
            cypher_wins: 5654,
            cypher_fails: 1032
          }
        }
      ],
      app_id: 'lq70afwx',
      lastSnapshot: 1641980779,
      segmentKey: 'oHSyew3ytP1f1zgLPB4xJJnIYjgGUZXV',
      allowUserStatsInDesktop: true,
      allowCrashReportsInDesktop: true,
      desktopTrackingId: '545d24ec-5829-49fd-9ea1-b4dd2edf8381'
    }
    expect(cleanUdcFromStorage(test as any)).toEqual({
      allowCrashReportsInDesktop: true,
      allowUserStatsInDesktop: true,
      auraNtId: undefined,
      consentBannerShownCount: 0,
      desktopTrackingId: '545d24ec-5829-49fd-9ea1-b4dd2edf8381',
      lastSnapshot: 1641980779,
      segmentKey: 'oHSyew3ytP1f1zgLPB4xJJnIYjgGUZXV',
      uuid: '262e82d0-52da-433b-9e7f-3896d406f1a7'
    })
  })
})

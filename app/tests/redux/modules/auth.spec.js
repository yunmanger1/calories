import reducer, { initialState } from 'redux/modules/auth'

describe('(Redux) auth', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})

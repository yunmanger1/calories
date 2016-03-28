import reducer, { initialState } from 'redux/modules/Records'

describe('(Redux) Records', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})

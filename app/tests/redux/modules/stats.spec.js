import reducer, { initialState } from 'redux/modules/Stats'

describe('(Redux) Stats', () => {
  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})

import {createSlice} from '@reduxjs/toolkit'

const getDefaultSlotConfig = i => ({
  id: i,
  slotNaming: `car_${i}`,
  slotTitle: `Slot ${i}`,

  isValidSetup: [true, true, true, true, true],
  carSetup: [0.5, 0.5, 0.5, 0.5, 0.5],
  biasParam: [0.5, 0.5, 0.5, 0.5, 0.5],
  prevCarSetup: [0.5, 0.5, 0.5, 0.5, 0.5],
  prevBiasParam: [0.5, 0.5, 0.5, 0.5, 0.5],
  feedback: [[], [], [], [], []],
  track: "XX",
  previousRuns: [],

});
const totalSlots = 4;
const initialSlots = Array.from(Array(totalSlots)).map((x, i) => getDefaultSlotConfig(i+1));

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    slots: initialSlots,
  },
  reducers: {
    setSlots: (state,  { payload }) => {
      state.slots = payload
    },
    addSlot: (state) => {
      let nextAvailableSlotId = 1;
      for(const slot of state.slots) {
        if (nextAvailableSlotId === slot.id) {
          nextAvailableSlotId++;
        }
      }
      state.slots = [...state.slots, getDefaultSlotConfig(nextAvailableSlotId)]
    },
    renameSlot: (state, { payload: { id, slotTitle } }) => {
      state.slots = state.slots.map(
        (x, _idx) =>
          x.id === id ? {...x, slotTitle} : x
      )
    },
    updateSlot: (state, { payload: { id, payload } }) => {
      state.slots = [...state.slots.map(
        x => x.id === id ? {...x, ...payload} : x
      )]
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  setSlots,
  renameSlot,
  addSlot,
  updateSlot,
  removeSlot,
} = configSlice.actions

export default configSlice.reducer
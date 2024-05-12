import { StudentTypes } from "./student-types";
import { createReducer } from "../utils";

const initialState = {
  student: [],
  selected_student: [],
};

const FetchAllStudentFinish = (state, payload) => ({
  ...state,
  student: payload.student.map((s) => {
    return Object.assign(s, {
      key: s._id,
    });
  }),
});

const FetchMyStudentFinish = (state, payload) => ({
  ...state,
  selected_student: payload.students,
});

const UpdateStudentFinish = (state, payload) => ({
  ...state,
  selected_student: payload._ids,
});

export const StudentReducer = createReducer(initialState, {
  [StudentTypes.FETCH_ALL_STUDENT_FINISH]: FetchAllStudentFinish,
  [StudentTypes.FETCH_MY_STUDENT_FINISH]: FetchMyStudentFinish,
  [StudentTypes.UPDATE_STUDENT_FINISH]: UpdateStudentFinish,
});

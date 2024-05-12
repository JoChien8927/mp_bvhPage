import { StudentTypes } from "./student-types";

const FetchAllStudentStart = () => ({
  type: StudentTypes.FETCH_ALL_STUDENT_START,
});

const FetchAllStudentFinish = (student) => ({
  type: StudentTypes.FETCH_ALL_STUDENT_FINISH,
  payload: {
    student: student,
  },
});

const FetchMyStudentStart = (_id) => ({
  type: StudentTypes.FETCH_MY_STUDENT_START,
  payload: {
    _id: _id,
  },
});

const FetchMyStudentFinish = (students) => ({
  type: StudentTypes.FETCH_MY_STUDENT_FINISH,
  payload: {
    students: students,
  },
});

const UpdateStudentStart = (_id, _ids) => ({
  type: StudentTypes.UPDATE_STUDENT_START,
  payload: {
    _id: _id,
    _ids: _ids,
  },
});

const UpdateStudentFinish = (_ids) => ({
  type: StudentTypes.UPDATE_STUDENT_FINISH,
  payload: {
    _ids: _ids,
  },
});

export const StudentAction = {
  FetchAllStudentStart,
  FetchAllStudentFinish,
  FetchMyStudentStart,
  FetchMyStudentFinish,
  UpdateStudentStart,
  UpdateStudentFinish,
};

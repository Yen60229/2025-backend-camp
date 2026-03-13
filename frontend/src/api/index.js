import { getCreditPackages, postCreditPackage } from "./credit-package.js";
import {
  getCoaches,
  getCoachDetail,
  getCoachCourses,
  getSkills,
  postSkill,
  deleteSkill,
} from "./coaches.js";
import {
  postSignup,
  postLogin,
  getUserCourses,
  getUserCreditPackage,
  getUserProfile,
  putUserProfile,
  putUserPassword,
} from "./users.js";
import { postCourse, deleteCourse } from "./courses.js";
import {
  getCoach,
  putCoach,
  getAdminCoachCourses,
  getCoachCourse,
  postCourses,
  putCourses,
  getMonthlyRevenue,
  postPromoteUserToCoach,
} from "./admin.js";

export {
  getCreditPackages,
  postCreditPackage,
  getCoaches,
  getCoachDetail,
  getCoachCourses,
  getSkills,
  postSkill,
  deleteSkill,
  postSignup,
  postLogin,
  getUserCourses,
  getUserCreditPackage,
  getUserProfile,
  putUserProfile,
  putUserPassword,
  postCourse,
  deleteCourse,
  getCoach,
  putCoach,
  getAdminCoachCourses,
  getCoachCourse,
  postCourses,
  putCourses,
  getMonthlyRevenue,
  postPromoteUserToCoach,
};

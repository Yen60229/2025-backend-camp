import { createRouter, createWebHistory } from "vue-router";
// import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/user";
import { getDataFromCookieByKey } from "../utils/cookie.js";
import { getUserProfile } from "../api/index.js";
import { jwtDecode } from "jwt-decode";

const routes = [
  {
    path: "/",
    component: () => import("../pages/public/HomeView.vue"),
  },
  {
    path: "/coaches",
    component: () => import("../pages/public/CoachesView.vue"),
  },
  {
    path: "/coaches/:coachId",
    component: () => import("../pages/public/CoachDetail.vue"),
  },
  {
    path: "/fitness-plans",
    component: () => import("../pages/public/FitnessPlans.vue"),
  },
  {
    path: "/login",
    component: () => import("../pages/public/auth/LoginView.vue"),
  },
  {
    path: "/signup",
    component: () => import("../pages/public/auth/SignupView.vue"),
  },
  {
    path: "/user",
    component: () => import("../pages/user/UserLayout.vue"),
    redirect: "/user/dashboard",
    meta: { requiredRole: "USER" },
    children: [
      {
        path: "dashboard",
        component: () => import("../pages/user/DashboardView.vue"),
      },
      {
        path: "profile",
        component: () => import("../pages/user/ProfileView.vue"),
      },
      {
        path: "orders",
        component: () => import("../pages/user/OrdersView.vue"),
      },
    ],
  },
  {
    path: "/coach",
    component: () => import("../pages/coach/CoachLayout.vue"),
    redirect: "/coach/profile",
    meta: { requiredRole: "COACH" },
    children: [
      {
        path: "profile",
        component: () => import("../pages/coach/ProfileView.vue"),
      },
      {
        path: "courses",
        component: () => import("../pages/coach/CoursesView.vue"),
      },
      {
        path: "earnings",
        component: () => import("../pages/coach/EarningsView.vue"),
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("../pages/admin/AdminLayout.vue"),
    redirect: "/admin/dashboard",
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        component: () => import("../pages/admin/DashboardView.vue"),
      },
      {
        path: "skills",
        component: () => import("../pages/admin/SkillsView.vue"),
      },
      {
        path: "promote-trainer",
        component: () => import("../pages/admin/PromoteTrainer.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

router.beforeEach(async (to, _from, next) => {
  const token = getDataFromCookieByKey("token");

  if (token) {
    await getProfile(token);
  }

  const { role } = useUserStore();

  if (to.meta.requiresAuth) {
    if (!role) {
      next({ path: "/login" });
      return;
    }
  }

  if (to.meta.requiredRole) {
    if (!role) {
      next({ path: "/login" });
      return;
    }
    if (to.meta.requiredRole === "COACH" && role === "USER") {
      next({ path: "/" });
      return;
    }
  }

  next();
});

async function getProfile(token) {
  try {
    const { data } = await getUserProfile();
    const { role } = jwtDecode(token);
    const { setCurrentUser } = useUserStore();
    setCurrentUser({
      name: data.user.name,
      role,
    });
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[getProfile] error : ${msg}`);
  }
}

export default router;

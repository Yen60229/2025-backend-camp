<template>
  <div class="w-full py-12 md:py-16 lg:py-20 bg-primary-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 2xl:px-0">
      <div
        class="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 md:mb-12 lg:mb-16 gap-4 md:gap-6"
      >
        <h2 class="text-2xl md:text-3xl lg:text-4xl font-black text-primary-0">健身方案介紹</h2>
        <p
          class="text-base md:text-lg lg:text-xl text-primary-300 lg:text-right max-w-2xl"
        >
          我們提供多種靈活的價格方案，滿足不同客戶的需求。無論是短期課程還是長期計畫，您都能找到最適合自己的選擇，並享受相應的優惠。
        </p>
      </div>

      <div class="text-center mb-8 md:mb-10 lg:mb-12">
        <p class="text-sm md:text-base font-bold leading-[120%] text-primary-400 mb-2">COURSE PLAN</p>
        <h3 class="text-[28px] md:text-[32px] lg:text-[40px] font-black leading-[120%] mb-2 md:mb-3">
          <span class="text-primary-0">選擇適合</span>
          <span class="text-secondary-800">你的方案</span>
        </h3>
        <p class="text-sm md:text-base font-normal leading-[150%] text-primary-300">
          選擇最適合你的健身課程方案
        </p>
      </div>

      <ul
        class="flex flex-col sm:flex-row sm:flex-wrap gap-4 md:gap-6 lg:gap-8 justify-center"
      >
        <li
          class="w-full sm:w-auto border-2 border-primary-600 rounded-lg p-6 md:p-8 hover:border-secondary-800 transition-colors sm:flex-1 flex flex-col sm:min-w-0 sm:basis-[calc(50%-1rem)] lg:basis-[calc(33.333%-1.5rem)] sm:max-w-[400px]"
          v-for="item in processedCreditPackageList"
          :key="item.id"
        >
          <div class="mb-4 md:mb-6 text-center">
            <p
              class="text-xl md:text-2xl font-black leading-[120%] text-primary-0 mb-3 md:mb-4"
            >
              {{ item.name }}
            </p>
            <p class="text-3xl md:text-4xl font-black leading-[120%] text-secondary-800 mb-2">
              ${{ $formatCurrency(item.price) }}
              <span class="text-lg md:text-xl text-primary-300">元</span>
            </p>
          </div>
          <ul class="space-y-2 md:space-y-3 grow">
            <li class="flex items-start">
              <span class="text-secondary-800 mr-2 text-lg md:text-xl shrink-0"
                >✓</span
              >
              <span class="text-primary-300 text-sm md:text-base font-normal leading-[150%]"
                >包含{{ item.credit_amount }}堂課，一堂50分鐘</span
              >
            </li>
            <li class="flex items-start">
              <span class="text-secondary-800 mr-2 text-lg md:text-xl shrink-0"
                >✓</span
              >
              <span class="text-primary-300 text-sm md:text-base font-normal leading-[150%]"
                >平均每堂價格：${{
                  $formatCurrency(item.avgPricePerCredit)
                }}元</span
              >
            </li>
          </ul>
          <button
            @click="buyCreditPackage(item.id)"
            class="w-full mt-6 md:mt-8 h-12 px-5 py-3 bg-secondary-800 text-primary-900 rounded text-base font-medium leading-[150%] hover:opacity-90 transition-opacity inline-flex items-center justify-center"
          >
            選擇方案
          </button>
        </li>
      </ul>

      <div
        class="border-2 border-primary-600 rounded-lg p-6 md:p-10 lg:p-16 transition-colors mt-12 md:mt-20 lg:mt-32 flex flex-col items-center text-center"
      >
        <h5 class="text-2xl md:text-3xl lg:text-4xl font-black text-primary-0">
          立即購買課程組合包方案
        </h5>
        <p
          class="text-base md:text-lg lg:text-xl font-bold leading-[150%] text-primary-300 mt-4 md:mt-6 lg:mt-8"
        >
          選擇適合您的課程包，開始您的健身之旅!
        </p>
        <a
          href="tel:+88622298332"
          class="text-base md:text-lg lg:text-xl font-bold leading-[150%] text-secondary-800 hover:underline mt-4 md:mt-6 lg:mt-8"
          >聯絡客服：(02)229-8332</a
        >
      </div>
    </div>
  </div>
  <RedirectModal
    v-if="redirectModal"
    message="您尚未登入，請先登入以繼續操作。"
    button-text="前往登入頁面"
    button-link="/login"
    @closeRedirectModal="closeRedirectModal"
  />
  <FitnessPlanSuccessModal
    v-if="fitnessPlanSuccessModal"
    @closeFitnessPlanSuccessModal="closeFitnessPlanSuccessModal"
  />
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import RedirectModal from "../../components/RedirectModal.vue";
import FitnessPlanSuccessModal from "../../components/FitnessPlanSuccessModal.vue";
import { getCreditPackages, postCreditPackage } from "../../api/index.js";
import { getDataFromCookieByKey } from "../../utils/cookie.js";
import swalHandler from "../../utils/swalHandler.js";

const { proxy } = getCurrentInstance();

const creditPackageList = ref([]);
const redirectModal = ref(false);
const fitnessPlanSuccessModal = ref(false);

const processedCreditPackageList = computed(() => {
  return creditPackageList.value.map((item) => {
    const avgPricePerCredit = Math.round(item.price / item.credit_amount);

    return {
      ...item,
      avgPricePerCredit,
    };
  });
});

function openRedirectModal() {
  redirectModal.value = true;
}
function closeRedirectModal() {
  redirectModal.value = false;
}
function openFitnessPlanSuccessModal() {
  fitnessPlanSuccessModal.value = true;
}
function closeFitnessPlanSuccessModal() {
  fitnessPlanSuccessModal.value = false;
}

async function getCreditPackageList() {
  try {
    const { data } = await getCreditPackages();
    creditPackageList.value = data;
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[getCreditPackageList] error : ${msg}`);
  }
}

async function buyCreditPackage(id) {
  try {
    if (!getDataFromCookieByKey("token")) {
      openRedirectModal();
      return;
    }
    const { status } = await postCreditPackage(id);
    if (status === "success") {
      openFitnessPlanSuccessModal();
    }
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { status, message } = error.response.data;
      msg = message;

      if (status === "failed") {
        swalHandler(proxy.$swal, message);
        return;
      }
    }

    throw new Error(`[buyCreditPackage] error : ${msg}`);
  }
}

onMounted(() => {
  getCreditPackageList();
});
</script>

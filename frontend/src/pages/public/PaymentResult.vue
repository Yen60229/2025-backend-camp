<template>
  <div class="w-full py-12 md:py-16 lg:py-20 bg-primary-900 min-h-screen">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 text-center">
      <div
        class="border-2 rounded-lg p-8 md:p-12"
        :class="isSuccess ? 'border-green-500' : 'border-red-500'"
      >
        <div class="text-6xl mb-6">
          {{ isSuccess ? "✓" : "✗" }}
        </div>
        <h2
          class="text-2xl md:text-3xl font-black mb-4"
          :class="isSuccess ? 'text-green-400' : 'text-red-400'"
        >
          {{ isSuccess ? "付款成功" : "付款失敗" }}
        </h2>
        <p class="text-primary-300 text-base md:text-lg mb-4">
          {{ isSuccess ? "感謝您的購買！您的健身方案已成功開通。" : "付款過程中發生問題，請稍後再試或聯繫客服。" }}
        </p>
        <p v-if="orderNo" class="text-primary-400 text-sm mb-8">
          訂單編號：{{ orderNo }}
        </p>
        <router-link
          to="/fitness-plans"
          class="inline-block px-8 py-3 bg-secondary-800 text-primary-900 rounded text-base font-medium hover:opacity-90 transition-opacity"
        >
          返回方案頁面
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const isSuccess = computed(() => route.query.status === "success");
const orderNo = computed(() => route.query.orderNo || "");
</script>

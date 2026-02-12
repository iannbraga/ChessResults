import { computed, onMounted, onUnmounted, ref } from 'vue';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const isMobile = ref<boolean | undefined>(undefined);

  const updateIsMobile = () => {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
  };

  const setupMediaQuery = () => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Set initial value
    updateIsMobile();

    // Add event listener
    mql.addEventListener('change', updateIsMobile);

    // Return cleanup function
    return () => mql.removeEventListener('change', updateIsMobile);
  };

  let cleanup: (() => void) | null = null;

  onMounted(() => {
    cleanup = setupMediaQuery();
  });

  onUnmounted(() => {
    if (cleanup) {
      cleanup();
    }
  });

  // Return reactive value that converts undefined to false
  return computed(() => !!isMobile.value);
}

import { defineStore,acceptHMRUpdate } from 'pinia'

export const mtStore = defineStore('MTStore', {
    state: () => ({
        // isMT: extractDataFromAccessToken()['o:t'] === 'Teacher',
        isLayoutMT: null
    }),
    // getters: {
    //     isLayoutMT: (state) => state.layoutMT,
    // },
    getters: {
        isMT: () => {
            const tokenData = extractDataFromAccessToken()
            return tokenData?.['o:t'] === 'Teacher'
        }
    },
    actions: {
        async get() {
            const route = useRoute();
            this.isLayoutMT = route.path.includes('/moduleTeacher');
        },
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(mtStore, import.meta.hot));
}

// Automatically execute the `get()` function when the store is used.
export function useMT() {
    const store = mtStore();

    onMounted(() => {
        store.get();
    })
    return store;
}


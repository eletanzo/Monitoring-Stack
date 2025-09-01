<template>
  <v-container class="py-6">
    <v-card elevation="4" class="pa-4">
      <v-card-title>
        <h2 class="text-h5">IP Manager</h2>
      </v-card-title>

      <v-card-text>
        <!-- Add IP Form -->
        <v-form @submit.prevent="addIp">
          <v-text-field
            v-model="newIp"
            label="Enter IP Address"
            prepend-inner-icon="mdi-lan"
            outlined
            dense
            hide-details
          />
          <v-btn
            type="submit"
            color="primary"
            class="mt-2"
            :disabled="!newIp"
          >
            Add IP
          </v-btn>
        </v-form>

        <v-divider class="my-4"></v-divider>

        <!-- IP List -->
        <v-list>
          <v-list-item
            v-for="ip in ips"
            :key="ip.id"
          >
            <v-hover v-slot="{ isHovering, props }">
              <v-row
                align="center"
                justify="space-between"
                class="w-100 transition-all"
                :class="{ 'bg-grey-darken-3': isHovering }"
                v-bind="props"
              >
                <!-- IP text always visible -->
                <v-col cols="auto">
                  <v-list-item-title>{{ ip.ip }}</v-list-item-title>
                </v-col>

                <!-- Trash icon on the right, fades in -->
                <v-col cols="auto">
                  <v-fade-transition>
                    <v-btn
                      v-show="isHovering"
                      icon
                      color="red"
                      @click="removeIp(ip.id)"
                    > 
                      <v-icon icon="mdi-delete" />
                    </v-btn>
                  </v-fade-transition>
                </v-col>
              </v-row>
            </v-hover>
            <v-divider />
          </v-list-item>
        </v-list>

      </v-card-text>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const ips = ref([]);
const newIp = ref("");

// Snackbar
const snackbar = ref({
  show: false,
  message: "",
  color: "success"
});

// API URL
const API_URL = '/api';

const fetchIps = async () => {
  const res = await axios.get(`${API_URL}/ips`);
  ips.value = res.data;
};

const showSnackbar = (message, color = "success") => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

const addIp = async () => {
  if (!newIp.value) return;
  try {
    await axios.post(`${API_URL}/ips`, { ip: newIp.value });
    showSnackbar("✅ IP added successfully");
    newIp.value = "";
    fetchIps();
  } catch (err) {
    showSnackbar("⚠️ Failed to add IP: " + (err.response?.data?.error ? err.response.data.error : "Unknown error") , "error");
  }
};

const removeIp = async (id) => {
  try {
    await axios.delete(`${API_URL}/ips/${id}`);
    showSnackbar("🗑️ IP removed successfully");
    fetchIps();
  } catch (err) {
    showSnackbar("⚠️ Failed to remove IP: " + (err.response?.data?.error ? err.response.data.error : "Unknown error"), "error");
  }
};

onMounted(fetchIps);
</script>

<style scoped>
.transition-all {
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

</style>

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = RAW_BASE_URL.replace(/\/$/, '');

export const apiService = {
  async analyzeDrug(vcfFile, drugName) {
    const formData = new FormData();
    formData.append('vcf', vcfFile);
    formData.append('drug', drugName);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze/`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header when using FormData - browser sets it automatically with boundary
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

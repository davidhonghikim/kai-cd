# 🖼️ 08: Services - Image Generation

This document explains how to integrate image generation services. This category is one of the most complex due to the large number of parameters involved.

## Core Capability: `image_generation`

The `image_generation` capability is used for services that create images from text prompts (`txt2img`) or other images (`img2img`).

### `image_generation` Capability Schema

*   **`capability`**: Must be `'image_generation'`.
*   **`endpoints`**:
    *   `txt2img`: Endpoint for text-to-image generation.
    *   `img2img`: Endpoint for image-to-image generation.
    *   `getModels` (optional): Endpoint to list available checkpoint models.
    *   `getLoras` (optional): Endpoint to list LoRA models.
    *   `getSamplers` (optional): Endpoint to list sampling methods.
    *   `getUpscalers` (optional): Endpoint to list upscalers.
*   **`parameters`**:
    *   This capability has two parameter sets: `txt2img` and `img2img`.
    *   Key parameters include `prompt`, `negative_prompt`, `steps`, `cfg_scale`, `width`, `height`, and `seed`.
    *   See the reference implementation for a full list.

## Reference Implementation: A1111 WebUI

The `a1111.ts` definition is the gold standard for an image generation service. It is a complete and feature-rich example.

### A1111 API Endpoints

*   **txt2img Endpoint:** `POST /sdapi/v1/txt2img`
*   **img2img Endpoint:** `POST /sdapi/v1/img2img`
*   **Get Models Endpoint:** `GET /sdapi/v1/sd-models`
*   **Get Samplers Endpoint:** `GET /sdapi/v1/samplers`
*   **Get Upscalers Endpoint:** `GET /sdapi/v1/upscalers`
*   **Get LoRAs Endpoint:** `GET /sdapi/v1/loras`

### `a1111.ts` Definition Highlights

The `a1111.ts` file demonstrates several key features:

1.  **Shared Parameters:** It defines a base parameter array for `txt2img` and reuses it for `img2img` to reduce code duplication.
2.  **Dynamic Options:** It uses `optionsEndpoint` for parameters like `sampler_name` and `sd_model_checkpoint`. This tells the UI to make API calls to populate dropdowns with choices available on the user's A1111 instance.
3.  **User Configuration:** It specifies the required `--api` and `--cors-allow-origins` flags in the `configuration` section.

Any new image generation service should be modeled after this file. 
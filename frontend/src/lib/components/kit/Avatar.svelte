<script lang="ts">
  // Avatar circle — tinted initials, the tint hashed from the email (see
  // avatarTint.ts), so a seed renders the same tint wherever it appears.

  import { getInitials } from '$lib/utils/initials'
  import { avatarTint } from './avatarTint'

  interface Props {
    /** Email address used as the color-hash seed. */
    email: string
    /** Optional display name. If absent, initials derive from email. */
    name?: string
    /** Density preset. */
    density?: 'micro' | 'compact' | 'standard' | 'large'
    /** Override the density-derived pixel size (rare). */
    size?: number
    /** Inline base64-encoded photo bytes. When set with photoMediaType, the
     *  avatar renders as an <img> instead of initials. Falls back to initials
     *  on image load error. */
    photoData?: string
    /** Photo media type (e.g. "image/jpeg"). Required alongside photoData. */
    photoMediaType?: string
    /** Maximum initials shown. Defaults to one at 20 px or smaller, else two;
     *  pass 1 for overlapping pairs. */
    initials?: 1 | 2
  }

  const { email, name, density = 'standard', size, photoData, photoMediaType, initials }: Props = $props()

  // Photo rendering state: true when we have data+media-type AND the img loaded
  // successfully. On error (broken base64, unsupported MIME, etc.), falls back
  // to initials.
  let photoFailed = $state(false)
  const showPhoto = $derived(!!photoData && !!photoMediaType && !photoFailed)

  // Density → pixel size table. Tuned to match mail UI's density visual weight.
  const DENSITY_SIZE: Record<NonNullable<Props['density']>, number> = {
    micro: 24,
    compact: 28,
    standard: 32,
    large: 40,
  }

  const px = $derived(size ?? DENSITY_SIZE[density])
  // 12px floor (DS-6): a single initial at 20px is 12px, two initials start at 24px and fit.
  const fontPx = $derived(Math.max(12, Math.round(px * 0.4)))
  const tint = $derived(avatarTint(email || ''))
  // Shared with mail so a contact and a sender with the same name match.
  const text = $derived(getInitials(name || email).slice(0, initials ?? (px <= 20 ? 1 : 2)))
</script>

<div
  class="rounded-full shrink-0 inline-flex items-center justify-center font-medium overflow-hidden {showPhoto ? '' : `avatar-${tint}`}"
  data-avatar-tint={showPhoto ? undefined : tint}
  style:width="{px}px"
  style:height="{px}px"
  style:font-size="{fontPx}px"
  aria-hidden="true"
>
  {#if showPhoto}
    <img
      src="data:{photoMediaType};base64,{photoData}"
      alt=""
      class="w-full h-full object-cover"
      onerror={() => { photoFailed = true }}
    />
  {:else}
    {text}
  {/if}
</div>

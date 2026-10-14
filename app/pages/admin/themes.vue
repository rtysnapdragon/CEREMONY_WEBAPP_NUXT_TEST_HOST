<template>
  <RWrapperPage class="themes-page">
    <RPageHeader
      title="Theme Management"
      subtitle="Customize your app's visual identity with dynamic CSS token themes"
      icon="ri-palette-line"
    >
      <template #actions>
        <label class="btn-ghost" style="cursor:pointer">
          <i class="ri-upload-2-line" /> Import
          <input ref="importFileRef" type="file" accept=".json" multiple style="display:none" @change="onImportFile" />
        </label>
        <button class="btn-primary" @click="openCreate">
          <i class="ri-add-line" /> New Theme
        </button>
      </template>
    </RPageHeader>

    <!-- Main layout -->
    <div class="themes-layout animate-fade-up delay-1">
      <!-- Sidebar: theme list -->
      <aside class="themes-sidebar">
        <div class="sidebar-search">
          <input v-model="sidebarSearch" class="search-input" placeholder="Search themes…" />
        </div>
        <div class="sidebar-list">
          <div
            v-for="theme in filteredThemes"
            :key="theme.id"
            class="theme-card"
            :class="{ active: selectedThemeId === theme.id }"
            @click="selectTheme(theme)"
          >
            <div class="color-swatches">
              <span
                v-for="(color, ci) in (theme.previewColors || []).slice(0, 5)"
                :key="ci"
                class="swatch-dot"
                :style="{ background: color }"
              />
              <span v-if="!theme.previewColors?.length" class="swatch-dot" style="background:var(--c-accent)" />
            </div>
            <div class="theme-card-header">
              <span class="theme-card-name">{{ theme.name }}</span>
              <span v-if="theme.isDefault" class="badge badge-success" style="font-size:0.65rem;padding:2px 6px">Active</span>
            </div>
            <div v-if="theme.description" class="theme-card-desc">{{ theme.description }}</div>
            <div class="theme-card-actions" @click.stop>
              <button v-if="!theme.isDefault" class="btn-xs" title="Activate" @click="doActivate(theme)">
                <i class="ri-check-line" />
              </button>
              <button class="btn-xs" title="Edit tokens" @click="selectTheme(theme)">
                <i class="ri-edit-line" />
              </button>
              <button class="btn-xs" title="Duplicate" @click="doDuplicate(theme)">
                <i class="ri-file-copy-line" />
              </button>
              <button class="btn-xs" title="Export JSON" @click="doExport(theme)">
                <i class="ri-download-line" />
              </button>
              <button class="btn-xs btn-danger-xs" title="Delete" @click="confirmDelete(theme)">
                <i class="ri-delete-bin-line" />
              </button>
            </div>
          </div>

          <div v-if="filteredThemes.length === 0" class="sidebar-empty">
            <i class="ri-palette-line" style="font-size:2rem;opacity:.3" />
            <p>No themes yet</p>
          </div>
        </div>

        <div class="sidebar-footer">
          <button class="btn-primary" style="width:100%" @click="openCreate">
            <i class="ri-add-line" /> Create Theme
          </button>
        </div>
      </aside>

      <!-- Editor panel -->
      <div class="editor-panel">
        <!-- Placeholder when nothing selected -->
        <div v-if="!selectedTheme" class="editor-empty">
          <i class="ri-palette-line" style="font-size:3rem;opacity:.25;display:block;margin-bottom:12px" />
          <p style="color:var(--c-muted)">Select a theme from the sidebar to edit its tokens</p>
        </div>

        <template v-else>
          <!-- Tab bar -->
          <div class="tab-bar">
            <button
              v-for="tab in activeTabs"
              :key="tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <i :class="tab.icon" style="margin-right:4px" />{{ tab.label }}
            </button>

            <div style="flex:1" />

            <!-- Preview toggle -->
            <button class="tab-btn" :class="{ active: showPreview }" @click="showPreview = !showPreview">
              <i class="ri-eye-line" style="margin-right:4px" />Preview
            </button>
          </div>

          <div class="editor-body">
            <!-- Token editor -->
            <div class="token-editor">
              <!-- Invitation color tokens (type=INVITATION themes only) -->
              <template v-if="activeTab === 'invitation'">
                <div class="token-editor-header">
                  <div class="token-col-label">Invite Token</div>
                  <div class="token-col-light"><i class="ri-sun-line" style="margin-right:4px" />Color</div>
                </div>
                <div v-for="def in INVITE_TOKEN_DEFS" :key="def.token" class="token-row">
                  <div class="token-meta">
                    <code class="token-name">{{ def.token }}</code>
                    <span class="token-desc">{{ def.description }}</span>
                  </div>
                  <div class="token-swatch-col">
                    <button
                      class="color-swatch"
                      :style="{ background: editTokens[def.token]?.light || def.lightValue }"
                      @click.stop="togglePicker($event, def.token, 'light')"
                    />
                    <input
                      :value="editTokens[def.token]?.light || def.lightValue"
                      class="token-input"
                      placeholder="#c9a84c"
                      @input="onTokenChange(def.token, 'light', ($event.target as HTMLInputElement).value)"
                    />
                  </div>
                </div>
                <div class="token-save-row">
                  <button class="btn-primary btn-sm" :disabled="saving" @click="saveTokens">
                    <i v-if="saving" class="ri-loader-4-line animate-spin" />
                    Save Invite Colors
                  </button>
                </div>
              </template>

              <!-- Core / Semantic / Component color tokens -->
              <template v-else-if="activeTab === 'core' || activeTab === 'semantic' || activeTab === 'component'">
                <div class="token-editor-header">
                  <div class="token-col-label">Token</div>
                  <div class="token-col-light">
                    <i class="ri-sun-line" style="margin-right:4px" />Light
                  </div>
                  <div class="token-col-dark">
                    <i class="ri-moon-line" style="margin-right:4px" />Dark
                  </div>
                  <div style="width:36px" />
                </div>

                <div v-for="token in tabTokens" :key="token.token" class="token-row">
                  <div class="token-info">
                    <span class="token-name">{{ token.token }}</span>
                    <span class="token-desc">{{ token.description }}</span>
                  </div>

                  <!-- Light value -->
                  <div class="color-cell">
                    <div class="swatch-wrap">
                      <div
                        class="swatch"
                        :style="{ background: editTokens[token.token]?.light || '#ccc' }"
                        @click.stop="togglePicker($event, token.token, 'light')"
                      />
                    </div>
                    <input
                      v-model="(editTokens[token.token] ??= { light: '', dark: '' }).light"
                      class="hex-input"
                      placeholder="#rrggbb or rgba()"
                      @input="onTokenChange(token.token, 'light', ($event.target as HTMLInputElement).value)"
                    />
                  </div>

                  <!-- Dark value -->
                  <div class="color-cell">
                    <div class="swatch-wrap">
                      <div
                        class="swatch"
                        :style="{ background: editTokens[token.token]?.dark || '#ccc' }"
                        @click.stop="togglePicker($event, token.token, 'dark')"
                      />
                    </div>
                    <input
                      v-model="(editTokens[token.token] ??= { light: '', dark: '' }).dark"
                      class="hex-input"
                      placeholder="#rrggbb or rgba()"
                      @input="onTokenChange(token.token, 'dark', ($event.target as HTMLInputElement).value)"
                    />
                  </div>

                  <!-- Reset -->
                  <button class="btn-icon btn-xs-icon" title="Reset to default" @click="resetToken(token.token)">
                    <i class="ri-refresh-line" />
                  </button>
                </div>

                <!-- Save bar -->
                <div class="save-bar">
                  <span class="text-muted" style="font-size:0.8rem">{{ tabTokens.length }} tokens in this category</span>
                  <div style="display:flex;gap:8px">
                    <button class="btn-ghost" @click="themeStore.clearPreview()">Discard Preview</button>
                    <button class="btn-primary" :disabled="saving" @click="saveTokens">
                      <i class="ri-save-line" />
                      {{ saving ? 'Saving…' : 'Save Tokens' }}
                    </button>
                  </div>
                </div>
              </template>

              <!-- ── Typography tab ──────────────────────────────────────────────── -->
              <template v-else-if="activeTab === 'typography'">
                <div class="extras-section-header">
                  <i class="ri-text" />
                  Typography Tokens
                  <span class="extras-hint">Control font families, sizes, weight, and spacing</span>
                </div>

                <div class="extras-grid">
                  <div v-for="f in TYPOGRAPHY_FIELDS" :key="f.var" class="extras-row">
                    <div class="extras-label">
                      <span class="token-name" style="font-size:0.72rem">{{ f.var }}</span>
                      <span class="token-desc">{{ f.label }}</span>
                      <span class="extras-hint-inline">{{ f.hint }}</span>
                    </div>
                    <input
                      v-model="editTypography[f.var]"
                      class="extras-input"
                      :placeholder="f.hint"
                    />
                    <button
                      class="btn-icon btn-xs-icon"
                      title="Reset to default"
                      @click="editTypography[f.var] = DEFAULT_TYPOGRAPHY[f.var as keyof typeof DEFAULT_TYPOGRAPHY]"
                    >
                      <i class="ri-refresh-line" />
                    </button>
                  </div>
                </div>

                <!-- Live typography preview -->
                <div class="typo-preview">
                  <p class="typo-preview-label">Preview</p>
                  <div
                    class="typo-preview-block"
                    :style="{
                      fontFamily: editTypography['--font-body'] || 'inherit',
                      fontSize:   editTypography['--font-size-base'] || '14px',
                      fontWeight: editTypography['--font-weight-base'] || '400',
                      lineHeight: editTypography['--line-height-base'] || '1.6',
                      letterSpacing: editTypography['--letter-spacing'] || '0em',
                    }"
                  >
                    <h2
                      :style="{
                        fontFamily: editTypography['--font-heading'] || 'inherit',
                        fontWeight: '700',
                        fontSize: 'calc(' + (editTypography['--font-size-base'] || '14px') + ' * 1.5)',
                        margin: '0 0 8px',
                      }"
                    >The quick brown fox</h2>
                    <p style="margin:0 0 6px">
                      Jumps over the lazy dog. <strong>Bold text.</strong> <em>Italic style.</em>
                    </p>
                    <code
                      :style="{ fontFamily: editTypography['--font-mono'] || 'monospace', fontSize: '0.85em' }"
                    >font-family: {{ editTypography['--font-body'] || 'inherit' }}</code>
                  </div>
                </div>

                <div class="save-bar">
                  <span class="text-muted" style="font-size:0.8rem">{{ TYPOGRAPHY_FIELDS.length }} typography tokens</span>
                  <button class="btn-primary" :disabled="saving" @click="saveTokens">
                    <i class="ri-save-line" /> {{ saving ? 'Saving…' : 'Save Tokens' }}
                  </button>
                </div>
              </template>

              <!-- ── Spacing tab ─────────────────────────────────────────────────── -->
              <template v-else-if="activeTab === 'spacing'">
                <div class="extras-section-header">
                  <i class="ri-layout-column-line" />
                  Spacing Scale
                  <span class="extras-hint">CSS variables used throughout the app for padding and gaps</span>
                </div>

                <div class="spacing-grid">
                  <div v-for="f in SPACING_FIELDS" :key="f.var" class="spacing-row">
                    <div class="spacing-label">
                      <span class="token-name" style="font-size:0.72rem">{{ f.var }}</span>
                      <span class="token-desc">{{ f.label }}</span>
                    </div>
                    <input
                      v-model="editSpacing[f.var]"
                      class="extras-input"
                      style="width:100px"
                      :placeholder="f.defaultVal"
                    />
                    <div
                      class="spacing-bar"
                      :style="{ width: 'min(' + (editSpacing[f.var] || f.defaultVal) + ', 120px)', maxWidth: '120px' }"
                    />
                    <button
                      class="btn-icon btn-xs-icon"
                      title="Reset"
                      @click="editSpacing[f.var] = f.defaultVal"
                    >
                      <i class="ri-refresh-line" />
                    </button>
                  </div>
                </div>

                <div class="save-bar">
                  <span class="text-muted" style="font-size:0.8rem">{{ SPACING_FIELDS.length }} spacing tokens</span>
                  <button class="btn-primary" :disabled="saving" @click="saveTokens">
                    <i class="ri-save-line" /> {{ saving ? 'Saving…' : 'Save Tokens' }}
                  </button>
                </div>
              </template>

              <!-- ── Border Radius tab ───────────────────────────────────────────── -->
              <template v-else-if="activeTab === 'radius'">
                <div class="extras-section-header">
                  <i class="ri-rounded-corner" />
                  Border Radius
                  <span class="extras-hint">Round corners for cards, buttons, inputs, and badges</span>
                </div>

                <div class="radius-grid">
                  <div v-for="f in RADIUS_FIELDS" :key="f.var" class="radius-card">
                    <div
                      class="radius-demo-box"
                      :style="{
                        borderRadius: editRadius[f.var] || f.defaultVal,
                        background: 'color-mix(in srgb, var(--c-accent) 18%, transparent)',
                        border: '1.5px solid var(--c-accent)',
                      }"
                    />
                    <span class="token-name" style="font-size:0.7rem;margin-bottom:2px">{{ f.var }}</span>
                    <span class="token-desc" style="margin-bottom:6px">{{ f.label }}</span>
                    <input
                      v-model="editRadius[f.var]"
                      class="extras-input"
                      style="width:100%"
                      :placeholder="f.defaultVal"
                    />
                    <button
                      class="btn-icon btn-xs-icon"
                      style="margin-top:4px;align-self:flex-end"
                      title="Reset"
                      @click="editRadius[f.var] = f.defaultVal"
                    >
                      <i class="ri-refresh-line" />
                    </button>
                  </div>
                </div>

                <div class="save-bar">
                  <span class="text-muted" style="font-size:0.8rem">{{ RADIUS_FIELDS.length }} radius tokens</span>
                  <button class="btn-primary" :disabled="saving" @click="saveTokens">
                    <i class="ri-save-line" /> {{ saving ? 'Saving…' : 'Save Tokens' }}
                  </button>
                </div>
              </template>

              <!-- ── Shadow tab ──────────────────────────────────────────────────── -->
              <template v-else-if="activeTab === 'shadow'">
                <div class="extras-section-header">
                  <i class="ri-stack-line" />
                  Shadow Tokens
                  <span class="extras-hint">Box shadows for elevation levels</span>
                </div>

                <div class="shadow-list">
                  <div v-for="f in SHADOW_FIELDS" :key="f.var" class="shadow-row">
                    <div class="shadow-demo">
                      <div
                        class="shadow-box"
                        :style="{
                          boxShadow: editShadows[f.var] || f.defaultVal,
                        }"
                      >{{ f.label }}</div>
                    </div>
                    <div class="shadow-info">
                      <span class="token-name" style="font-size:0.72rem">{{ f.var }}</span>
                      <textarea
                        v-model="editShadows[f.var]"
                        class="extras-input"
                        style="width:100%;height:52px;resize:vertical;font-family:monospace;font-size:0.72rem"
                        :placeholder="f.defaultVal"
                      />
                    </div>
                    <button
                      class="btn-icon btn-xs-icon"
                      title="Reset"
                      style="flex-shrink:0;align-self:center"
                      @click="editShadows[f.var] = f.defaultVal"
                    >
                      <i class="ri-refresh-line" />
                    </button>
                  </div>
                </div>

                <div class="save-bar">
                  <span class="text-muted" style="font-size:0.8rem">{{ SHADOW_FIELDS.length }} shadow tokens</span>
                  <button class="btn-primary" :disabled="saving" @click="saveTokens">
                    <i class="ri-save-line" /> {{ saving ? 'Saving…' : 'Save Tokens' }}
                  </button>
                </div>
              </template>

              <!-- Presets tab -->
              <template v-else-if="activeTab === 'presets'">
                <div class="preset-grid">
                  <div
                    v-for="preset in themeStore.presets"
                    :key="preset.id"
                    class="preset-card"
                    @click="previewPreset(preset)"
                  >
                    <div class="color-swatches" style="margin-bottom:8px">
                      <span
                        v-for="(c, ci) in (preset.previewColors || []).slice(0, 5)"
                        :key="ci"
                        class="swatch-dot"
                        :style="{ background: c }"
                      />
                    </div>
                    <div style="font-weight:600;font-size:0.9rem;margin-bottom:4px">{{ preset.name }}</div>
                    <div style="font-size:0.75rem;color:var(--c-muted);margin-bottom:10px">{{ preset.description }}</div>
                    <button class="btn-primary" style="width:100%;font-size:0.8rem" @click.stop="applyPresetConfirm(preset)">
                      Apply Preset
                    </button>
                  </div>
                  <div v-if="!themeStore.presets.length" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--c-muted)">
                    No presets available
                  </div>
                </div>
              </template>
            </div>

            <!-- Live preview panel -->
            <aside v-if="showPreview" class="preview-panel">
              <div class="preview-header">
                <span style="font-weight:600;font-size:0.85rem">Live Preview</span>
                <button
                  class="btn-xs"
                  :class="{ active: previewDark }"
                  @click="previewDark = !previewDark"
                >
                  <i :class="previewDark ? 'ri-moon-line' : 'ri-sun-line'" />
                  {{ previewDark ? 'Dark' : 'Light' }}
                </button>
              </div>

              <!-- App shell preview -->
              <div class="preview-app" :class="{ 'preview-dark': previewDark }" :style="previewStyle">

                <!-- Sidebar -->
                <div class="pv-sidebar">
                  <div class="pv-logo">
                    <div class="pv-logo-icon"><i class="ri-heart-line" /></div>
                    <span class="pv-logo-text">Sarika</span>
                  </div>
                  <div class="pv-nav">
                    <div class="pv-nav-item pv-active"><i class="ri-dashboard-line" /><span>Dashboard</span></div>
                    <div class="pv-nav-item"><i class="ri-user-line" /><span>Guests</span></div>
                    <div class="pv-nav-item"><i class="ri-calendar-event-line" /><span>Ceremonies</span></div>
                    <div class="pv-nav-item"><i class="ri-table-line" /><span>Seating</span></div>
                    <div class="pv-nav-item"><i class="ri-mail-send-line" /><span>Invitations</span></div>
                    <div class="pv-nav-group">Finance</div>
                    <div class="pv-nav-item"><i class="ri-money-dollar-circle-line" /><span>Budget</span></div>
                    <div class="pv-nav-item"><i class="ri-gift-line" /><span>Gifts</span></div>
                  </div>
                </div>

                <!-- Main area -->
                <div class="pv-main">

                  <!-- Top header -->
                  <div class="pv-header">
                    <div class="pv-header-title">Dashboard</div>
                    <div class="pv-header-right">
                      <div class="pv-search"><i class="ri-search-line" /></div>
                      <div class="pv-bell"><i class="ri-notification-3-line" /><span class="pv-bell-dot" /></div>
                      <div class="pv-avatar">A</div>
                    </div>
                  </div>

                  <div class="pv-content">
                    <!-- Stat cards row -->
                    <div class="pv-stats">
                      <div class="pv-stat-card">
                        <div class="pv-stat-icon pv-icon-accent"><i class="ri-user-heart-line" /></div>
                        <div>
                          <div class="pv-stat-val">248</div>
                          <div class="pv-stat-label">Guests</div>
                        </div>
                      </div>
                      <div class="pv-stat-card">
                        <div class="pv-stat-icon pv-icon-success"><i class="ri-checkbox-circle-line" /></div>
                        <div>
                          <div class="pv-stat-val">186</div>
                          <div class="pv-stat-label">Confirmed</div>
                        </div>
                      </div>
                      <div class="pv-stat-card">
                        <div class="pv-stat-icon pv-icon-info"><i class="ri-gift-line" /></div>
                        <div>
                          <div class="pv-stat-val">$12k</div>
                          <div class="pv-stat-label">Gifts</div>
                        </div>
                      </div>
                    </div>

                    <!-- Card with table -->
                    <div class="pv-card">
                      <div class="pv-card-head">
                        <span class="pv-card-title">Guest List</span>
                        <button class="pv-btn-primary"><i class="ri-add-line" /> Add Guest</button>
                      </div>
                      <div class="pv-table">
                        <div class="pv-table-head">
                          <span>Name</span><span>Status</span><span>Table</span>
                        </div>
                        <div class="pv-table-row">
                          <span>Sophea Chan</span>
                          <span class="pv-badge pv-badge-success">Confirmed</span>
                          <span class="pv-muted">T-04</span>
                        </div>
                        <div class="pv-table-row">
                          <span>Dara Kim</span>
                          <span class="pv-badge pv-badge-accent">Invited</span>
                          <span class="pv-muted">T-02</span>
                        </div>
                        <div class="pv-table-row">
                          <span>Maly Pech</span>
                          <span class="pv-badge pv-badge-danger">Declined</span>
                          <span class="pv-muted">—</span>
                        </div>
                      </div>
                    </div>

                    <!-- Second card: form inputs + buttons -->
                    <div class="pv-card">
                      <div class="pv-card-title" style="margin-bottom:8px">Quick Add</div>
                      <input class="pv-input" placeholder="Guest name…" readonly />
                      <div style="display:flex;gap:6px;margin-top:8px">
                        <button class="pv-btn-primary" style="flex:1">Save</button>
                        <button class="pv-btn-ghost" style="flex:1">Cancel</button>
                      </div>
                    </div>

                    <!-- Color token swatches -->
                    <div class="pv-card pv-token-swatches">
                      <div class="pv-card-title" style="margin-bottom:8px">Token Preview</div>
                      <div class="pv-swatch-grid">
                        <div v-for="tv in PREVIEW_TOKENS" :key="tv.var" class="pv-swatch-item">
                          <div class="pv-swatch-dot" :style="{ background: currentValue(tv.var) }" />
                          <span class="pv-swatch-name">{{ tv.var.replace('--c-', '') }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </template>
      </div>
    </div>


    <!-- Create / Edit drawer -->
    <RDrawer
      v-model:open="showDrawer"
      :title="editingTheme ? 'Edit Theme' : 'Create Theme'"
      icon="ri-palette-line"
      width-desktop="420px"
      width-tablet="92vw"
      @close="closeDrawer"
    >
      <template #body>
        <form id="theme-form" class="drawer-form" novalidate @submit.prevent="saveTheme">
          <div class="form-group">
            <label class="input-label">Theme Name <span class="required-star">*</span></label>
            <RInput
              v-model="form.name"
              placeholder="e.g. Sakura Spring"
              :error="!!errors.name"
              @on-input="form.code = toCode(form.name); delete errors.name"
            />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </div>
          <div class="form-group">
            <label class="input-label">Code <span class="text-muted" style="font-size:0.72rem">(auto-generated)</span></label>
            <RInput v-model="form.code" placeholder="e.g. sakura-spring" />
          </div>
          <div class="form-group">
            <label class="input-label">Description</label>
            <RInput v-model="form.description" type="textarea" :rows="2" placeholder="Optional description…" />
          </div>
          <div class="form-group">
            <label class="input-label">Theme Type</label>
            <select v-model="form.type" class="input">
              <option value="APP">APP — Admin Dashboard</option>
              <option value="INVITATION">INVITATION — Invite Template</option>
            </select>
            <p class="sub-text" style="margin-top:4px">
              INVITATION themes appear in the template theme picker.
            </p>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="drawer-footer-btns">
          <button class="btn-ghost" @click="closeDrawer">Cancel</button>
          <button type="submit" form="theme-form" class="btn-primary" :disabled="drawerSaving">
            {{ drawerSaving ? 'Saving…' : (editingTheme ? 'Update' : 'Create') }}
          </button>
        </div>
      </template>
    </RDrawer>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="deletingTheme" class="modal-backdrop" @click.self="deletingTheme = null">
          <div class="theme-modal theme-modal-sm">
            <div class="theme-modal-header">
              <span>Delete Theme</span>
              <button class="btn-icon" @click="deletingTheme = null"><i class="ri-close-line" /></button>
            </div>
            <div class="theme-modal-body">
              <p>Are you sure you want to delete <strong>{{ deletingTheme.name }}</strong>? This cannot be undone.</p>
            </div>
            <div class="theme-modal-footer">
              <button class="btn-ghost" @click="deletingTheme = null">Cancel</button>
              <button class="btn-danger" :disabled="deleting" @click="doDelete">
                {{ deleting ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Floating draggable color picker -->
    <Teleport to="body">
      <div
        v-if="pickerTarget"
        class="color-picker-float"
        :style="{ left: pickerPos.x + 'px', top: pickerPos.y + 'px' }"
        @click.stop
      >
        <div class="cpf-header" @mousedown.prevent="startDrag">
          <span class="cpf-title">
            {{ pickerTarget.token }} · {{ pickerTarget.mode }}
          </span>
          <button class="cpf-close" @click="pickerTarget = null">
            <i class="ri-close-line" />
          </button>
        </div>
        <RColorPicker
          :model-value="toHex(pickerTarget.mode === 'light'
            ? (editTokens[pickerTarget.token]?.light ?? '')
            : (editTokens[pickerTarget.token]?.dark ?? ''))"
          @update:model-value="(v: string) => applyPickerColor(pickerTarget!.token, pickerTarget!.mode, v)"
        />
      </div>
    </Teleport>
  </RWrapperPage>
</template>

<script setup lang="ts">
import {
  useThemePage, TABS, COLOR_TABS, PREVIEW_TOKENS, INVITE_TOKEN_DEFS,
  TYPOGRAPHY_FIELDS, SPACING_FIELDS, RADIUS_FIELDS, SHADOW_FIELDS,
  DEFAULT_TYPOGRAPHY,
} from '~/composables/useThemePage'

definePageMeta({
  layout: 'navbar',
  middleware: ['auth'],
})

const {
  themeStore,
  selectedThemeId, editTokens, activeTab, showPreview, previewDark, saving, sidebarSearch,
  editTypography, editSpacing, editRadius, editShadows,
  pickerTarget, pickerPos,
  showDrawer, editingTheme, drawerSaving, form, errors,
  deletingTheme, deleting,
  importFileRef,
  filteredThemes, selectedTheme, tabTokens, previewStyle, activeTabs,
  toCode, selectTheme, onTokenChange, resetToken, togglePicker, toHex, applyPickerColor,
  currentValue, saveTokens,
  doActivate, doToggleActive, doDuplicate, doExport, onImportFile, previewPreset, applyPresetConfirm,
  openCreate, openEditModal, closeDrawer, saveTheme,
  confirmDelete, doDelete,
  startDrag,
  init, cleanup,
} = useThemePage()

onMounted(init)
onUnmounted(cleanup)
</script>

<style lang="scss" scoped>
.themes-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 24px);
  overflow: hidden;
}

.themes-layout {
  display: flex;
  gap: 0;
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg, 12px);
  background: var(--c-surface);
  margin-top: 12px;
}

// ── Sidebar ────────────────────────────────────────────────────────────────
.themes-sidebar {
  width: 280px;
  min-width: 280px;
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--c-bg);
}

.sidebar-search {
  padding: 12px;
  border-bottom: 1px solid var(--c-border);

  .search-input {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid var(--c-border);
    border-radius: 8px;
    background: var(--c-surface);
    color: var(--c-text);
    font-size: 0.82rem;
    outline: none;

    &:focus { border-color: var(--c-accent); }
  }
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
}

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--c-muted);
  font-size: 0.85rem;
}

.theme-card {
  padding: 12px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--c-border);
  transition: background 150ms;

  &:hover { background: var(--c-hover); }

  &.active {
    background: rgba(255, 140, 66, 0.08);
    border-left: 3px solid var(--c-accent);
    padding-left: 11px;
  }
}

.theme-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}

.theme-card-name {
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--c-text);
}

.theme-card-desc {
  font-size: 0.72rem;
  color: var(--c-muted);
  margin-bottom: 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.theme-card-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.btn-xs {
  padding: 3px 8px;
  font-size: 0.72rem;
  border: 1px solid var(--c-border);
  border-radius: 5px;
  background: var(--c-surface);
  color: var(--c-text);
  cursor: pointer;
  transition: background 120ms;
  display: inline-flex;
  align-items: center;
  gap: 3px;

  &:hover { background: var(--c-hover); }
  &.active { background: var(--c-accent); color: #fff; border-color: var(--c-accent); }
  &.btn-xs-on  { color: var(--c-success); border-color: var(--c-success); }
  &.btn-xs-off { color: var(--c-muted);   border-color: var(--c-border);  }
}

.btn-danger-xs {
  color: var(--c-danger);
  &:hover { background: rgba(248, 113, 113, 0.1); }
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--c-border);
}

// ── Color swatches ─────────────────────────────────────────────────────────
.color-swatches {
  display: flex;
  gap: 3px;
  margin-bottom: 6px;
}

.swatch-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

// ── Editor panel ───────────────────────────────────────────────────────────
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.editor-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

// ── Tab bar ────────────────────────────────────────────────────────────────
.tab-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 16px 0;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-surface);
  flex-shrink: 0;
}

.tab-btn {
  padding: 6px 14px;
  font-size: 0.82rem;
  border-radius: 6px 6px 0 0;
  border: 1px solid transparent;
  border-bottom: none;
  background: transparent;
  color: var(--c-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: color 120ms;

  &:hover { color: var(--c-text); }
  &.active {
    background: var(--c-bg);
    color: var(--c-accent);
    font-weight: 600;
    border-color: var(--c-border);
    border-bottom-color: var(--c-bg);
    position: relative;
    bottom: -1px;
  }
}

// ── Editor body ────────────────────────────────────────────────────────────
.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.token-editor {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.token-editor-header {
  display: grid;
  grid-template-columns: 200px 1fr 1fr 36px;
  gap: 12px;
  padding: 6px 0 8px;
  border-bottom: 2px solid var(--c-border);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.token-row {
  display: grid;
  grid-template-columns: 200px 1fr 1fr 36px;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--c-border);

  &:last-child { border-bottom: none; }
}

.token-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.token-swatch-col {
  display: flex;
  align-items: center;
  gap: 8px;
}
.token-save-row {
  display: flex;
  justify-content: flex-end;
  padding: var(--sp-4) 0 0;
}
.token-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.token-name {
  font-family: 'JetBrains Mono', 'Fira Mono', monospace;
  font-size: 0.78rem;
  color: var(--c-accent);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.token-desc {
  font-size: 0.68rem;
  color: var(--c-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.color-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;

  .swatch-wrap {
    flex-shrink: 0;
  }

  .swatch {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    border: 1px solid var(--c-border);
    cursor: pointer;
    transition: background 200ms ease, transform 140ms ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

    &:hover { transform: scale(1.15); }
  }

  .hex-input {
    flex: 1;
    min-width: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    padding: 4px 7px;
    border: 1px solid var(--c-border);
    border-radius: 6px;
    background: var(--c-bg);
    color: var(--c-text);

    &:focus {
      outline: none;
      border-color: var(--c-accent);
      box-shadow: 0 0 0 2px rgba(255, 140, 66, 0.15);
    }
  }
}

.save-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0 4px;
  margin-top: 8px;
  border-top: 1px solid var(--c-border);
  flex-shrink: 0;
}

// ── Preset grid ────────────────────────────────────────────────────────────
.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 4px 0;
}

.preset-card {
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: border-color 150ms, box-shadow 150ms;
  background: var(--c-surface);

  &:hover {
    border-color: var(--c-accent);
    box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
  }
}

// ── Preview panel ──────────────────────────────────────────────────────────
.preview-panel {
  width: 380px;
  min-width: 380px;
  border-left: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--c-bg);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}

// App shell preview — all elements use inline CSS vars from :style="previewStyle"
// Transition mixin applied to every element so color edits animate smoothly
$pv-transition: background 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;

.preview-app {
  flex: 1;
  overflow-y: auto;
  display: flex;
  font-size: 11px;
  line-height: 1.4;
  background: var(--c-bg);
  color: var(--c-text);
  transition: $pv-transition;

  // Apply transition to every child so picking any color animates the whole preview
  * { transition: $pv-transition; }
}

// Sidebar
.pv-sidebar {
  width: 110px;
  min-width: 110px;
  background: var(--c-surface);
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  gap: 2px;
}

.pv-logo {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px 10px;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 6px;
}
.pv-logo-icon {
  width: 22px; height: 22px; border-radius: 6px;
  background: var(--c-accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
}
.pv-logo-text { font-weight: 700; font-size: 11px; color: var(--c-text); }

.pv-nav { display: flex; flex-direction: column; gap: 1px; padding: 0 6px; }
.pv-nav-group {
  font-size: 9px; text-transform: uppercase; letter-spacing: .06em;
  color: var(--c-muted); padding: 8px 4px 2px; font-weight: 600;
}
.pv-nav-item {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 6px; border-radius: 6px; cursor: pointer;
  color: var(--c-muted); font-size: 10px;
  &:hover { background: var(--c-hover); color: var(--c-text); }
  i { font-size: 12px; }
}
.pv-active {
  background: color-mix(in srgb, var(--c-accent) 15%, transparent);
  color: var(--c-accent);
  font-weight: 600;
}

// Main content
.pv-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.pv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
  gap: 8px;
}
.pv-header-title { font-weight: 700; font-size: 11px; color: var(--c-text); }
.pv-header-right { display: flex; align-items: center; gap: 6px; }
.pv-search {
  width: 18px; height: 18px; border-radius: 5px;
  background: var(--c-bg); border: 1px solid var(--c-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--c-muted); font-size: 10px; cursor: pointer;
}
.pv-bell {
  position: relative; width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-muted); cursor: pointer; font-size: 12px;
}
.pv-bell-dot {
  position: absolute; top: 2px; right: 2px;
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--c-danger); border: 1px solid var(--c-surface);
}
.pv-avatar {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--c-accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700; cursor: pointer;
}

.pv-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// Stat cards
.pv-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.pv-stat-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pv-stat-icon {
  width: 26px; height: 26px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; flex-shrink: 0;
}
.pv-icon-accent  { background: color-mix(in srgb, var(--c-accent)  18%, transparent); color: var(--c-accent); }
.pv-icon-success { background: color-mix(in srgb, var(--c-success) 18%, transparent); color: var(--c-success); }
.pv-icon-info    { background: color-mix(in srgb, var(--c-info)    18%, transparent); color: var(--c-info, #60a5fa); }
.pv-stat-val   { font-size: 13px; font-weight: 700; color: var(--c-text); }
.pv-stat-label { font-size: 9px; color: var(--c-muted); }

// Cards
.pv-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 10px;
}
.pv-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.pv-card-title { font-weight: 600; font-size: 10px; color: var(--c-text); }
.pv-muted { color: var(--c-muted); }

// Table
.pv-table { display: flex; flex-direction: column; gap: 0; }
.pv-table-head {
  display: grid; grid-template-columns: 1fr 70px 40px;
  padding: 4px 6px; background: var(--c-bg);
  font-size: 9px; font-weight: 600; color: var(--c-muted);
  text-transform: uppercase; letter-spacing: .04em;
  border-radius: 5px 5px 0 0; border: 1px solid var(--c-border);
  gap: 6px;
}
.pv-table-row {
  display: grid; grid-template-columns: 1fr 70px 40px;
  padding: 5px 6px; gap: 6px;
  border-left: 1px solid var(--c-border);
  border-right: 1px solid var(--c-border);
  border-bottom: 1px solid var(--c-border);
  font-size: 10px; color: var(--c-text);
  align-items: center;
  &:last-child { border-radius: 0 0 5px 5px; }
}

// Badges
.pv-badge {
  display: inline-block; padding: 1px 6px;
  border-radius: 20px; font-size: 9px; font-weight: 600; white-space: nowrap;
}
.pv-badge-success { background: color-mix(in srgb, var(--c-success) 18%, transparent); color: var(--c-success); }
.pv-badge-accent  { background: color-mix(in srgb, var(--c-accent)  18%, transparent); color: var(--c-accent); }
.pv-badge-danger  { background: color-mix(in srgb, var(--c-danger)  18%, transparent); color: var(--c-danger); }

// Buttons
.pv-btn-primary {
  padding: 4px 9px; background: var(--c-accent); color: #fff;
  border: none; border-radius: 5px; font-size: 9px; font-weight: 600;
  cursor: pointer; display: inline-flex; align-items: center; gap: 3px;
  white-space: nowrap;
}
.pv-btn-ghost {
  padding: 4px 9px; background: transparent; color: var(--c-text);
  border: 1px solid var(--c-border); border-radius: 5px;
  font-size: 9px; cursor: pointer;
}

// Input
.pv-input {
  width: 100%; padding: 5px 8px;
  border: 1px solid var(--c-border); border-radius: 5px;
  background: var(--c-bg); color: var(--c-text);
  font-size: 10px; outline: none; box-sizing: border-box;
}

// Swatch grid
.pv-token-swatches { }
.pv-swatch-grid {
  display: flex; flex-wrap: wrap; gap: 5px;
}
.pv-swatch-item {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.pv-swatch-dot {
  width: 20px; height: 20px; border-radius: 5px;
  border: 1px solid var(--c-border);
  transition: background 200ms ease;
}
.pv-swatch-name {
  font-size: 8px; color: var(--c-muted); text-align: center;
  max-width: 36px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

// ── Modal ──────────────────────────────────────────────────────────────────
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.theme-modal {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  width: min(92vw, 480px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  &.theme-modal-sm { width: min(92vw, 380px); }
}

.theme-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--c-border);
  font-weight: 600;
  color: var(--c-text);
}

.theme-modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  p { color: var(--c-text); font-size: 0.9rem; line-height: 1.5; }
  strong { color: var(--c-accent); }
}

.theme-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--c-border);
}

// ── Misc ───────────────────────────────────────────────────────────────────
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--c-text);
}

.required-star { color: var(--c-danger); margin-left: 2px; }

.input {
  padding: 8px 12px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-bg);
  color: var(--c-text);
  font-size: 0.88rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;

  &:focus { border-color: var(--c-accent); box-shadow: 0 0 0 2px rgba(255, 140, 66, 0.12); }
  &.input-error { border-color: var(--c-danger); }

  &[rows] { resize: vertical; font-family: inherit; }
}

.field-error {
  font-size: 0.73rem;
  color: var(--c-danger);
  display: flex;
  align-items: center;
  gap: 4px;

  &::before { content: '⚠'; font-size: 0.68rem; }
}

.btn-danger {
  padding: 8px 18px;
  background: var(--c-danger);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

// ── Transition ─────────────────────────────────────────────────────────────
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 180ms ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

// ── Token col headers ──────────────────────────────────────────────────────
.token-col-label { font-size: 0.72rem; }
.token-col-light,
.token-col-dark  { font-size: 0.72rem; display: flex; align-items: center; }
</style>

<style lang="scss">
/* Unscoped — lives in <body> via Teleport */
.color-picker-float {
  position: fixed;
  z-index: 9999;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
  min-width: 260px;
  overflow: hidden;
  user-select: none;

  .cpf-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--c-surface-2, var(--c-bg));
    border-bottom: 1px solid var(--c-border);
    cursor: grab;

    &:active { cursor: grabbing; }
  }

  .cpf-title {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--c-muted);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cpf-close {
    background: none;
    border: none;
    padding: 2px 4px;
    cursor: pointer;
    color: var(--c-muted);
    font-size: 1rem;
    line-height: 1;
    border-radius: 4px;

    &:hover { background: var(--c-border); color: var(--c-text); }
  }
}

// ── Extras tabs (Typography / Spacing / Radius / Shadow) ─────────────────────
.extras-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: var(--sp-4);
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--c-border);
  color: var(--c-text);
  i { color: var(--c-accent); font-size: 1.1rem; }
}
.extras-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--c-muted);
  margin-left: auto;
}
.extras-hint-inline {
  font-size: 0.7rem;
  color: var(--c-muted);
}

// ── Extras grid (typography fields) ──────────────────────────────────────────
.extras-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  overflow: hidden;
  margin-bottom: var(--sp-5);
}
.extras-row {
  display: grid;
  grid-template-columns: 1fr 280px 36px;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: color-mix(in srgb, var(--c-accent) 4%, var(--c-surface)); }
}
.extras-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  .token-name { font-family: monospace; }
  .token-desc { font-size: 0.8rem; font-weight: 500; color: var(--c-text); }
}
.extras-input {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: 6px 10px;
  color: var(--c-text);
  font-size: 0.8rem;
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: var(--c-accent); }
}

// ── Typography preview ────────────────────────────────────────────────────────
.typo-preview {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
  margin-bottom: var(--sp-4);
}
.typo-preview-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-muted);
  margin: 0 0 var(--sp-3);
}
.typo-preview-block {
  color: var(--c-text);
}

// ── Spacing grid ──────────────────────────────────────────────────────────────
.spacing-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  overflow: hidden;
  margin-bottom: var(--sp-5);
}
.spacing-row {
  display: grid;
  grid-template-columns: 160px 110px 1fr 36px;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  &:last-child { border-bottom: none; }
  &:hover { background: color-mix(in srgb, var(--c-accent) 4%, var(--c-surface)); }
}
.spacing-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  .token-name { font-family: monospace; }
  .token-desc { font-size: 0.78rem; font-weight: 500; color: var(--c-text); }
}
.spacing-bar {
  height: 10px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--c-accent) 55%, transparent);
  min-width: 2px;
  transition: width 0.25s;
}

// ── Radius grid ───────────────────────────────────────────────────────────────
.radius-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--sp-4);
  margin-bottom: var(--sp-5);
}
.radius-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  padding: var(--sp-4);
}
.radius-demo-box {
  width: 100%;
  height: 60px;
  margin-bottom: var(--sp-2);
  transition: border-radius 0.25s;
}

// ── Shadow list ───────────────────────────────────────────────────────────────
.shadow-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-bottom: var(--sp-5);
}
.shadow-row {
  display: grid;
  grid-template-columns: 120px 1fr 36px;
  align-items: center;
  gap: var(--sp-4);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  padding: var(--sp-4);
}
.shadow-demo {
  display: flex;
  align-items: center;
  justify-content: center;
}
.shadow-box {
  width: 72px;
  height: 54px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--c-muted);
  transition: box-shadow 0.25s;
}
.shadow-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>

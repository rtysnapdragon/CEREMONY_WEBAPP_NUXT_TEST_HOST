<template>
  <div class="event-empty-wrap">
  <AppActionNavbar class="navbar"/>
  <div class="event-empty">
    <div class="event-empty__card">
      <!-- Illustration -->
      <div class="event-empty__hero">
        <div class="event-empty__image-wrap">
          <img
            src="/images/wedding-organizer.png"
            alt="Wedding Organizer"
            class="event-empty__image"
          >

          <div class="floating floating--1">
            <i class="ri-heart-fill" />
          </div>

          <div class="floating floating--2">
            <i class="ri-calendar-event-line" />
          </div>

          <div class="floating floating--3">
            <i class="ri-group-line" />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="event-empty__content">
        <div class="event-empty__badge">
          <i class="ri-heart-3-fill" />
          {{ tBy({en:"Welcome", km:"ស្វាគមន៍"}) }}
        </div>

        <h1 class="event-empty__title">
          {{ tBy({en:"Create your first event", km:"បង្កើតព្រឹត្តិការណ៍ដំបូងរបស់អ្នក"}) }}
        </h1>

        <p class="event-empty__desc">
          {{
            tBy({en:"Before managing guests, invitations, RSVPs, schedules, and budgets, you need to create your event first.", km:"មុននឹងគ្រប់គ្រងភ្ញៀវ ការអញ្ជើញ ការឆ្លើយតប កាលវិភាគ និងថវិកា សូមបង្កើតព្រឹត្តិការណ៍ដំបូងរបស់អ្នកជាមុន។"})
          }}
        </p>

        <div class="event-empty__features">
          <div class="event-empty__feature">
            <i class="ri-group-line" />
            <span>{{ tBy({en:"Manage guests", km:"គ្រប់គ្រងភ្ញៀវ"}) }}</span>
          </div>

          <div class="event-empty__feature">
            <i class="ri-mail-send-line" />
            <span>{{ tBy({en:"Send invitations", km:"ផ្ញើលិខិតអញ្ជើញ"}) }}</span>
          </div>

          <div class="event-empty__feature">
            <i class="ri-calendar-schedule-line" />
            <span>{{ tBy({en:"Event schedule", km:"កាលវិភាគកម្មវិធី"}) }}</span>
          </div>

          <div class="event-empty__feature">
            <i class="ri-money-dollar-circle-line" />
            <span>{{ tBy({en:"Track budget", km:"តាមដានថវិកា"}) }}</span>
          </div>
        </div>

        <div class="event-empty__actions">
          <RBtn
            type="create"
            :label="tBy({en:'Create event', km:'បង្កើតព្រឹត្តិការណ៍'})"
            icon="ri-calendar-event-line"
            size="lg"
            class="event-empty__btn"
            @click="openWeddingCreate"
          />
        </div>
      </div>
    </div>
  </div>
  <CreateEventForm v-model:open="isOpen"/>
  </div>
</template>

<script setup>
const isOpen = ref(false)
const openWeddingCreate = () => {
  isOpen.value = true
}
defineEmits(['create', 'open'])
</script>

<style scoped lang="scss">
.event-empty-wrap {
  display: contents;
}
.navbar{
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: 300px;
}
.event-empty {
  min-height: calc(100vh - 180px);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 2rem;

  &__card {
    width: 100%;
    max-width: 1100px;

    // background: var(--glass-bg);
    // backdrop-filter: var(--glass-blur);

    // border: 1px solid var(--glass-border);
    // border-radius: 28px;

    // box-shadow: var(--glass-shadow);

    overflow: hidden;

    display: grid;
    grid-template-columns: 1fr 1fr;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  &__hero {
    position: relative;

    min-height: 520px;

    display: flex;
    align-items: center;
    justify-content: center;

    background:
      radial-gradient(
        circle at center,
        rgba(255, 140, 66, 0.15),
        transparent 70%
      );

    @media (max-width: 900px) {
      min-height: 320px;
    }
  }

  &__image-wrap {
    position: relative;
  }

  &__image {
    width: 100%;
    max-width: 360px;
    object-fit: contain;
  }

  &__content {
    padding: 3rem;

    display: flex;
    flex-direction: column;
    justify-content: center;

    @media (max-width: 768px) {
      padding: 2rem;
    }
  }

  &__badge {
    width: fit-content;

    display: flex;
    align-items: center;
    gap: .5rem;

    padding: .5rem 1rem;

    border-radius: 999px;

    background: rgba(255, 140, 66, .08);
    color: var(--c-accent);

    font-size: .8rem;
    font-weight: 600;

    margin-bottom: 1rem;
  }

  &__title {
    margin: 0;

    font-size: 2.2rem;
    font-weight: 800;
    line-height: 1.2;

    color: var(--c-text);

    @media (max-width: 768px) {
      font-size: 1.7rem;
    }
  }

  &__desc {
    margin-top: 1rem;
    margin-bottom: 2rem;

    color: var(--c-muted);
    line-height: 1.7;
  }

  &__features {
    display: grid;
    gap: 1rem;

    margin-bottom: 2rem;
  }

  &__feature {
    display: flex;
    align-items: center;
    gap: .85rem;

    padding: .9rem 1rem;

    background: rgba(255,255,255,.03);

    border: 1px solid var(--c-border);
    border-radius: 14px;

    transition: .25s ease;

    &:hover {
      transform: translateX(4px);
      border-color: var(--c-accent);
    }

    i {
      font-size: 1.2rem;
      color: var(--c-accent);
    }

    span {
      color: var(--c-text);
      font-weight: 500;
    }
  }

  &__actions {
    margin-top: .5rem;
  }

  &__btn {
    min-width: 240px;
  }
}

.floating {
  position: absolute;

  width: 54px;
  height: 54px;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--c-surface);
  border: 1px solid var(--glass-border);

  box-shadow: var(--glass-shadow);

  color: var(--c-accent);

  animation: float 4s ease-in-out infinite;

  i {
    font-size: 1.3rem;
  }

  &--1 {
    top: -10px;
    left: -20px;
  }

  &--2 {
    top: 20%;
    right: -30px;
    animation-delay: 1s;
  }

  &--3 {
    bottom: 10%;
    left: -30px;
    animation-delay: 2s;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
</style>
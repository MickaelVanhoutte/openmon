<div class="enemy-info" class:opened={opened}>

    <div class="name-lvl">
        <span>{monster.name}</span>
        <span>Lv {monster.level}</span>
    </div>

    <div class="status">
        <div class="hp">
            <span>HP</span>
            <div class="progressbar-wrapper">
                <div class="progressbar" style="--width:{percent + '%'}"></div>
            </div>
        </div>
    </div>

</div>

<script lang="ts">
    import {Monster} from "../../js/model/monster";

    export let opened;

    export let monster: Monster;

    $: percent = (monster.currentHp * 100 / monster.currentStats.HP);

</script>

<style lang="scss">

  .enemy-info {
    opacity: 0;
    visibility: hidden;

    background-color: antiquewhite;

    height: 12dvh;
    width: 30dvw;
    position: absolute;
    top: 2dvh;
    left: -30dvw;

    transition: left 0.5s ease-in-out;

    border: 14px solid #595b59;
    border-radius: 24px;

    padding: 16px;

    display: flex;
    flex-direction: column;
    gap: 10%;
    justify-content: space-evenly;

    &.opened {
      opacity: 1;
      visibility: visible;
      left: 1dvw;
    }

    .name-lvl {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 46px;
    }

    .status{
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .hp {

      width: 60%;
      display: flex;
      gap: 16px;
      background-color: #262626;
      color: orange;
      align-items: center;
      justify-content: space-evenly;
      border-radius: 8px;
      padding: 3px;

      span {
        padding: 0 0 0 12px;
        font-weight: bold;
      }

      .progressbar-wrapper {

        height: 24px;
        width: 100%;
        background-color: #595b59;
        border-radius: 4px;
        border: 2px solid white;

        .progressbar {
          width: var(--width);
          height: 100%;
          background: rgb(184,244,166);
          background: linear-gradient(0deg, rgba(184,244,166,1) 0%, rgba(86,170,58,1) 30%, rgba(86,170,58,1) 50%, rgba(86,170,58,1) 70%, rgba(184,244,166,1) 100%);
          text-align: center;
          border-radius: 2px;
        }
      }
    }
  }
</style>

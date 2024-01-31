<div class="enemy-info" class:opened={opened}>

    <div class="name-lvl">
        <span>{monster.name}</span>
        <span>Lv {monster.level}</span>
    </div>

    <div class="status">
        <div class="hp">
            <span>HP</span>
            <div class="progressbar-wrapper">
                <div class="progressbar" class:warning={percent <= 50} class:danger={percent < 15 }  style="--width:{percent + '%'}"></div>
            </div>
        </div>
        <!--{monster.currentHp} / {monster.currentStats.HP}-->
    </div>

</div>

<script lang="ts">
    import type {PokemonInstance} from "../../js/model/pokemons/pokemon";

    export let opened;

    export let monster: PokemonInstance;

    $: percent = Math.floor(monster.currentHp * 100 / monster.currentStats.hp);

</script>

<style lang="scss">

  .enemy-info {
    opacity: 0;
    visibility: hidden;
    z-index: 9;

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

    font-size: 46px;

    &.opened {
      opacity: 1;
      visibility: visible;
      left: 1dvw;
    }

    .name-lvl {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

          transition: width 1s ease-in-out, background 1s ease-in-out 1s;

          &.warning {
            background: rgb(255,241,164);
            background: linear-gradient(0deg, rgba(255,241,164,1) 0%, rgba(255,194,16,1) 30%, rgba(255,194,16,1) 50%, rgba(255,194,16,1) 70%, rgba(255,241,164,1) 100%);
          }
          &.danger {
            background: rgb(244,177,159);
            background: linear-gradient(0deg, rgba(244,177,159,1) 0%, rgba(223,85,48,1) 30%, rgba(223,85,48,1) 50%, rgba(223,85,48,1) 70%, rgba(244,177,159,1) 100%);
          }
        }
      }
    }
  }

  @media screen and (max-width: 1100px){
    .enemy-info{
      font-size: 36px;
      border: 8px solid #595b59;

      .hp {
        width: 80%;
        height: 18px;

        .progressbar-wrapper {
          height: 14px;
        }
      }
    }
  }

  /*@media screen and (max-width: 1100px) and (orientation: portrait) {
    .enemy-info{
      bottom: 30dvh;
      height: 15dvw;
      width: 30dvh;
      !*font-size: 36px;*!

      .hp {
        width: 80%;
      }
    }
  }*/
</style>

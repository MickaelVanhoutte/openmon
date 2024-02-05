<div class="menu" class:open={menuOpened}>
    <ul>
        <li>
            <button tabindex="0">Pokedex</button>
        </li>
        <li>
            <button>Pokemon</button>
        </li>
        <li>
            <button>Bag</button>
        </li>
        <li>
            <button>Trainer</button>
        </li>
        <li>
            <button on:click{saveCurrent}>Save</button>
        </li>
        <li>
            <button>Options</button>
        </li>
        <li>
            <button>Credits</button>
        </li>
    </ul>
</div>


<script lang="ts">

    import type {SaveContext} from "../../js/saves/saves";
    import {SelectedSave} from "../../js/saves/saves";

    export let menuOpened;

    export let saveContext: SaveContext;
    export let save: SelectedSave;

    function saveCurrent() {
        saveContext = saveContext.updateSave(save.save);
        this.menuOpened = false;
    }
</script>

<style lang="scss">
  .menu {
    position: absolute;
    top: 0;
    right: -30%;
    width: 30%;
    height: 100%;
    font-size: 36px;
    background-color: #FFFFFF;
    z-index: 3;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: right 0.3s ease-in-out;
    border: 3px solid #1e1e1e;
    border-radius: 16px;

    ul {
      box-shadow: inset #009688 0 0 0 5px,
      inset #059c8e 0 0 0 1px,
      inset #0cab9c 0 0 0 10px,
      inset #1fbdae 0 0 0 11px,
      inset #8ce9ff 0 0 0 16px,
      inset #48e4d6 0 0 0 17px,
      inset #e5f9f7 0 0 0 21px,
      inset #bfecf7 0 0 0 22px;
      border-radius: 12px;
      list-style: none;
      padding: 12px;
      box-sizing: border-box;
      margin: 0;
      display: flex;
      gap: 8px;
      flex-direction: column;
      height: 100%;
      width: 100%;
      align-items: center;

      li {
        font-size: 2rem;
        text-align: center;
        cursor: pointer;
        flex-grow: 1;

        width: 100%;
        height: 100%;
        //min-height: 60px;

        display: flex;
        align-items: center;
        justify-content: center;

        /*&:has(button:focus),*/
        &:hover {
          :before {
            content: "";
            width: 0;
            height: 0;
            border-top: 20px solid transparent;
            border-bottom: 20px solid transparent;
            border-left: 20px solid #262626;
            position: absolute;
            left: 40px;
          }
        }

        button {
          background: none;
          border: none;
          font-size: inherit;
          font-family: inherit;
          cursor: inherit;
          outline: none;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          :before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        }
      }
    }

    &.open {
      opacity: 1;
      pointer-events: all;
      right: 0;
    }
  }
</style>

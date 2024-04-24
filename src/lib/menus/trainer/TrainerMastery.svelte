<script lang="ts">
	import type { GameContext } from '../../../js/context/gameContext';
	import { defineHex, Grid, rectangle, ring, spiral } from 'honeycomb-grid';
	import { SVG } from '@svgdotjs/svg.js';
	import { onMount } from 'svelte';

	export let context: GameContext;
	let masteries;
	$: masteryPoints = context.player.masteryPoints;

	const tiles = [
		{
			q: 3,
			r: 2,
            cost: '1 pt.',
			title: 'CUT',
            color: '#EDC531',
			set: false
		},
        {
			q: 4,
			r: 2,
            cost: '2 pt.',
			title: 'SURF',
            color: '#EDC531',
			set: false
		},
        {
			q: 4,
			r: 3,
            cost: '1 pt.',
			title: 'ROCK SMASH',
            color: '#EDC531',
			set: false
		},
        {
			q: 3,
			r: 4,
            cost: '1 pt.',
			title: 'STRENGH',
            color: '#EDC531',
			set: false
		},
        {
			q: 2,
			r: 4,
			cost: '3 pt.',
			title: 'FLY',
            color: '#EDC531',
			set: false
		},
        {
			q: 2,
			r: 3,
            cost: '2 pt.',
			title: 'ROCK CLIMB',
            color: '#EDC531',
			set: false
		},
        {
			q: 3,
			r: 1,
            cost: '3 pt.',
			title: 'Shiny +10%',
			subTitle: '+10%',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 3,
			r: 0,
            cost: '5 pt.',
			title: 'Shiny +20%',
			subTitle: '+20%',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 5,
			r: 1,
            cost: '3 pt.',
			title: 'Catch +10%',
			subTitle: '+10%',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 6,
			r: 0,
            cost: '5 pt.',
			title: 'Catch +20%',
			subTitle: '+20%',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 5,
			r: 3,
            cost: '2 pt.',
			title: 'XP +10%',
			subTitle: '',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 6,
			r: 3,
            cost: '3 pt.',
			title: 'XP +20%',
			subTitle: '+20%',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 3,
			r: 5,
            cost: '5 pt.',
			title: 'IVs +5',
			subTitle: '+5',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 3,
			r: 6,
            cost: '10 pt.',
			title: 'IVs +5',
			subTitle: '+5',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 1,
			r: 5,
            cost: '3 pt.',
			title: 'EVs +1',
			subTitle: '+1',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 0,
			r: 6,
            cost: '5 pt.',
			title: 'EVs +2',
			subTitle: '+2',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 1,
			r: 3,
            cost: '5 pt.',
			title: 'Combo +5%',
			subTitle: '+5%',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 0,
			r: 3,
            cost: '10 pt.',
			title: 'Combo +5%',
			subTitle: '+5%',
            color: '#F7F6CF',
			set: false
		},
        {
			q: 2,
			r: 2,
            cost: '3 pt.',
			title: 'Stab +5%',
			subTitle: '+5%',
            color: '#baffc9',
			set: false
		},
        {
			q: 1,
			r: 2,
            cost: '3 pt.',
			title: 'Stab +5%',
			subTitle: '+5%',
            color: '#baffc9',
			set: false
		},
        {
			q: 2,
			r: 1,
            cost: '5 pt.',
			title: 'Stab +5%',
			subTitle: '+5%',
            color: '#baffc9',
			set: false
		},
        {
			q: 1,
			r: 4,
            cost: '3 pt.',
			title: 'non-STAB +5%',
			subTitle: '+5%',
            color: '#FFD5BA',
			set: false
		},
        {
			q: 0,
			r: 4,
            cost: '3 pt.',
			title: 'non-STAB +5%',
			subTitle: '+5%',
            color: '#FFD5BA',
			set: false
		},
        {
			q: 0,
			r: 5,
            cost: '5 pt.',
			title: 'non-STAB +5%',
			subTitle: '+5%',
            color: '#FFD5BA',
			set: false
		},
        {
			q: 2,
			r: 5,
            cost: '3 pt.',
			title: 'Resistance +4%',
			subTitle: '+4%',
            color: '#ECD5E3',
			set: false
		},
        {
			q: 1,
			r: 6,
            cost: '3 pt.',
			title: 'Resistance +3%',
			subTitle: '+3%',
            color: '#ECD5E3',
			set: false
		},
        {
			q: 2,
			r: 6,
            cost: '3 pt.',
			title: 'Resistance +3%',
			subTitle: '+3%',
            color: '#ECD5E3',
			set: false
		},
        {
			q: 4,
			r: 4,
            cost: '4 pt.',
			title: 'Effect +4%',
			subTitle: '+4%',
            color: '#FFA07A',
			set: false
		},
        {
			q: 4,
			r: 5,
            cost: '5 pt.',
			title: 'Effect +3%',
			subTitle: '+3%',
            color: '#FFA07A',
			set: false
		},
        {
			q: 5,
			r: 4,
            cost: '5 pt.',
			title: 'Effect +3%',
			subTitle: '+3%',
            color: '#FFA07A',
			set: false
		},
        {
			q: 4,
			r: 1,
            cost: '5 pt.',
			title: 'Weather dmg+10%',
			subTitle: '+10%',
            color: '#ABDEE6',
			set: false
		},
        {
			q: 4,
			r: 0,
            cost: '10 pt.',
			title: 'weather Own+1turn',
			subTitle: '+1 turn',
            color: '#ABDEE6',
			set: false
		},
        {
			q: 5,
			r: 0,
            cost: '10 pt.',
			title: 'Weather Opp-1turn',
			subTitle: '-1 turn',
            color: '#ABDEE6',
			set: false
		},
        {
			q: 5,
			r: 2,
            cost: '4 pt.',
			title: 'Accuracy +4%',
			subTitle: '+4%',
            color: '#40E0D0',
			set: false
		},
        {
			q: 6,
			r: 1,
            cost: '5 pt.',
			title: 'Accuracy +3%',
			subTitle: '+3%',
            color: '#40E0D0',
			set: false
		},
        {
			q: 6,
			r: 2,
            cost: '5 pt.',
			title: 'Accuracy +3%',
			subTitle: '+3%',
            color: '#40E0D0',
			set: false
		},
	];
        let count = 0;
	// you may want the origin to be the top left corner of a hex's bounding box
	// instead of its center (which is the default)
	const Hex = defineHex({ dimensions: 30, origin: 'topLeft' });
	const grid = new Grid(Hex, spiral({ radius: 3, start: [3, 3] }));
	function renderSVG(hex: Hex, draw: SVG.Doc) {
		console.log(hex.q, hex.r);
		let tile = tiles.find((tile) => tile.q === hex.q && tile.r === hex.r);

		const polygon = draw
			// create a polygon from a hex's corner points
			.polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
			.fill('white')
			.stroke({ width: 1, color: '#999' });

		 if (tile) {
            count++;
            if(tile?.color){
                polygon.fill(tile.color);
            } else {
                polygon.fill('white');
            }
            let width = hex.corners[0].x - hex.corners[3].x;
            
            draw.group().add(polygon)

            if(tile.cost){
                draw.text(tile.cost)
                    .move(hex.corners[0].x - width/2, hex.corners[0].y - 18)
                    .font({ fill: 'black', size: 12, anchor: 'middle', leading: 1 });
            }
            if(tile.title){
                tile.title.split(' ').forEach((word, i) => {
                    draw.text(word)
                        .move(hex.corners[0].x - width/2, hex.corners[0].y -4 + i*12)
                        .font({ fill: 'black', size: 12, anchor: 'middle', leading: 1 });
                });
                // draw.text(tile.title)
                //     .move(hex.corners[0].x - width/2, hex.corners[0].y - 2)
                //     .font({ fill: 'black', size: 11, anchor: 'middle', weight: 'bold', leading: 1.3 });
            }
            // if(tile.subTitle){
            //     draw.text(tile.subTitle)
            //         .move(hex.corners[0].x - width/2 + 10, hex.corners[0].y + 10)
            //         .font({ fill: 'black', size: 12, anchor: 'middle', leading: 1 });
            // }
	
		} 
        console.log(count);
		return
	}

	onMount(() => {
		const draw = SVG().addTo(masteries).size('100%', '100%');
		grid.forEach((hex) => renderSVG(hex, draw));
		masteries.addEventListener('click', ({ offsetX, offsetY }) => {
			const hex = grid.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false });
			console.log(hex);
		});
	});
</script>

<div class="masteries" bind:this={masteries}></div>
<span class="points">
    {masteryPoints} points
</span>

<style lang="scss">
	.masteries {
		height: calc(100dvh - 46px);
		width: 100dvw;
	}
    .points {
        position: absolute;
        top: 56px;
        right: 0;
        padding: 8px;
        font-size: 32px;
        color: white;
        text-shadow: 1px 1px 1px black;
    }
</style>

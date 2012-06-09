script.attachEvent(DIM3_EVENT_CONSTRUCT,'OnConstruct');
script.attachEvent(DIM3_EVENT_ANIMATION_WEAPON,'OnAnimation');
script.attachEvent(DIM3_EVENT_WEAPON_FIRE,'OnFire');

//
// machine gun construction
//

function OnConstruct(weap,subEvent,id,tick)
{
		// weapon model
		
	weap.model.on=true;
	weap.model.name="Shotgun";

		// setup how weapon is held in hand
		
	weap.handPosition.x=-500;
	weap.handPosition.y=-1400;
	weap.handPosition.z=2500;
	
	weap.handAngle.x=0;
	weap.handAngle.y=0;
	weap.handAngle.z=0;
	
		// setup how weapon is changed
		
	weap.hand.raiseTick=450;
	weap.hand.lowerTick=500;
	weap.hand.selectShift=800;
	
		// projectile setup
		
	weap.projectile.repeatOn=true;
	weap.projectile.repeatTick=100;
	
		// ammo and clips
		
	weap.ammo.initCount=50;
	weap.ammo.maxCount=50;
	
	weap.ammo.clip=true;
	weap.ammo.initClipCount=5;
	weap.ammo.maxClipCount=5;
	
		// recoil
		
	weap.recoil.minX=-10.0;
	weap.recoil.maxX=10.0;
	weap.recoil.resetX=0.01;
	
	weap.recoil.minY=-10.0;
	weap.recoil.maxY=10.0;
	weap.recoil.resetY=0.01;
	
		// crosshair
		
	weap.crosshair.on=true;
	weap.crosshair.type=DIM3_WEAPON_CROSSHAIR_TYPE_CENTER;
	weap.crosshair.name='xcross';

		// fails under water

	weap.setting.failInLiquid=true;
	
		// the projectiles

	weap.projectile.objectFireBoneName='Fire';
	weap.projectile.objectFirePoseName='Idle1';
		
	weap.projectile.add('ParticleBeam');

	weap.kickback.size = 50;
}

//
// machine gun animation
//

function OnAnimation(weap,subEvent,id,tick)
{
	switch (subEvent) {
		
		case DIM3_EVENT_ANIMATION_WEAPON_RAISE:
			//weap.model.animation.start('Lift');
			return;
		case DIM3_EVENT_ANIMATION_WEAPON_LOWER:
			//weap.model.animation.start('Drop');
			return;
		default:
			//weap.model.animation.change('Idle');
			return;
	}
}

//
// machine gun fire
//

var TimeCharged = 0;
var DateObject = new Date();
var TimeStartedCharging = 0;

function BeginCharging(weap)
{
	TimeStartedCharging = DateObject.valueOf();
}

function EndCharging(weap)
{
		
		// out of ammo?
		
	if (!weap.ammo.useAmmo(1)) {
	
			// attempt to change clips
			
		if (!weap.ammo.changeClip()) {
			weap.fire.cancel();
			return;
		}
		
			// run change animation
			
		weap.model.animation.startThenChange('Reload','Idle');
		
			// reload makes next fire wait longer
		
		weap.fire.cancel();
		return;
	}
	
		// model animation
		
	weap.model.animation.startThenChange('Shoot','Idle');	
	
		// spawn projectile


	weap.projectile.spawnFromCenter('ParticleBeam');
	
	var chargeInterval = 10;
	var timeCharged = DateObject.valueOf() - TimeStartedCharging;
	var power = Math.round((timeCharged - chargeInterval) / chargeInterval);

	for (var i = 0; i < power; i++)
		weap.projectile.spawnFromCenterSlop('ParticleBeam',10);

	//weap.projectile.spawnFromCenterSlop('Bullet',1.5);
		// run recoil
		
	weap.recoil.go();
	weap.kickback.kick();
}

function OnFire(weap,subEvent,id,tick)
{
		// check reload

	/*if (!weap.fire.pastLastFire(reloadWait)) {
		weap.fire.cancel();
		return;
	}*/

	if(weap.model.animation.currentAnimationName == "Shoot") {
		weap.fire.cancel();
		return;
	}

	if(weap.model.animation.currentAnimationName == "Reload") {
		weap.fire.cancel();
		return;
	}

		// key down and key repeat are from players
		
	if ((subEvent==DIM3_EVENT_WEAPON_FIRE_DOWN)) 
	{
		BeginCharging(weap);
		return;
	}
	else if(subEvent==DIM3_EVENT_WEAPON_FIRE_REPEAT)
	{

	}
	else
	{
		EndCharging(weap)
	}


		// cancel all other firings

	weap.fire.cancel();
}

function OnManualReload(weapon)
{
	iface.console.write("Doing Manual Reload");
	if(weapon.ammo.changeClip()) weapon.model.animation.startThenChange('Reload','Idle');
}

class_name RazlomBlock
extends StaticBody3D
var durability := 70.0
var block_id := ""
var falling := false
var game
var tint: Color

func hit(amount: float, impulse: Vector3 = Vector3.ZERO) -> void:
	if falling:
		return
	durability -= amount
	if durability <= 0:
		falling = true
		game.call_deferred("break_block", self, impulse)

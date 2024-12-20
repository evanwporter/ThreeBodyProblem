use tbp::{Ball, Vector, start_simulation_server};
use std::f64::consts::PI;

#[tokio::main]
async fn main() {
    let num_balls = 3;
    let radius = 100.0;
    let tangential_speed = 0.5;

    let canvas_center = Vector::new(400.0, 300.0);

    // Create balls arranged in a circle
    let balls: Vec<Ball> = (0..num_balls)
        .map(|i| {
            let angle = (i as f64) * (2.0 * PI / num_balls as f64);
            let position = Vector::new(
                canvas_center.x + radius * angle.cos(),
                canvas_center.y + radius * angle.sin(),
            );
            let velocity = Vector::new(
                -tangential_speed * angle.sin(),
                tangential_speed * angle.cos(),
            );
            Ball::new(position, velocity, Vector::ZERO, 10.0, 5.0)
        })
        .collect();

    let gravitational_constant = 5.0;
    let time_step = 1.0;

    start_simulation_server(balls, gravitational_constant, time_step).await;
}

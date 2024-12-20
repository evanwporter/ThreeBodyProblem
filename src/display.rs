use std::sync::{Arc, Mutex};
use warp::Filter;

use crate::{run_simulation_continuous, Ball};

pub async fn start_simulation_server(
    balls: Vec<Ball>,
    gravitational_constant: f64,
    time_step: f64,
) {
    let simulation = Arc::new(Mutex::new(run_simulation_continuous(
        balls,
        gravitational_constant,
        time_step,
    )));

    let simulation_route = warp::path("simulation").map({
        let simulation = Arc::clone(&simulation);
        move || {
            let mut sim = simulation.lock().unwrap(); // Lock the mutex to access the iterator
            let frame = sim.next().unwrap(); // Get the next frame
            warp::reply::json(&frame)
        }
    });

    let static_files = warp::fs::dir("static");

    let routes = simulation_route.or(static_files);

    println!("Server running at http://127.0.0.1:3030");
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}

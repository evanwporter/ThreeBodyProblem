use crate::vector::Vector;

#[derive(Debug, Clone)]
pub struct Ball {
    pub position: Vector,
    pub velocity: Vector,
    pub acceleration: Vector,
    pub mass: f64,
    pub radius: f64,
}

impl Ball {
    pub fn new(position: Vector, velocity: Vector, acceleration: Vector, mass: f64, radius: f64) -> Self {
        Self {
            position,
            velocity, // : Vector::new(0.0, 0.0),
            acceleration, //: Vector::new(0.0, 0.0),
            mass, //: 10.0,
            radius, //: 5.0,
        }
    }

    pub fn update(&mut self, timestep: f64) {
        self.velocity += self.acceleration * timestep;
        self.position += self.velocity * timestep;
    }
} 
import React, { useState, useEffect } from 'react';

import { truncate } from 'fs';
import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const foodList = await api.get('/foods');

      setFoods(foodList.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const newId = Math.max(...foods.map(foodItem => foodItem.id)) + 1;
      const newDish: IFoodPlate = {
        ...food,
        available: true,
        id: isFinite(newId) ? newId : 1,
      };
      await api.post('/foods', newDish);
      setFoods([...foods, newDish]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const editDish = {
      ...food,
      id: editingFood.id,
      available: editingFood.available,
    };
    const newFoodList = foods.map(foodItem => {
      if (foodItem.id !== editingFood.id) {
        return foodItem;
      }
      return editDish;
    });
    await api.put(`/foods/${editingFood.id}`, editDish);
    setFoods(newFoodList);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);
    setFoods(foods.filter(foodItem => foodItem.id !== id));
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;

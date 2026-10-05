###### - Transformer에서 Normalization 대신 DyT로 대체해도 그 이상의 성능으로 학습 가능!

# 1, 2. Introduction/Background
###### - Is Normalization Necessary?

Normalization layer는 deep neural network의 학습을 안정화하고 convergence를 빠르게 만드는 핵심 구성 요소로 여겨져 왔음. Transformer에서는 주로 **LayerNorm(LN)** 이나 **RMSNorm**을 사용함. 

###### 1. Layer Normalization

![[Pasted image 20261001231154.png]]

![[Pasted image 20261003144441.png]]
- mu, sigma: 해당 token의 feature들에서 계산한 mean과 variance
- gamma, beta: channel마다 학습하는 scale과 shift
- epsilon: 수치적 안정성을 위한 작은 상수

Normalization은 **Mean Centering + Deviation Scaling**의 과정으로 이뤄짐

###### 2. RMS Normalization
RMS Normalization은 Layer Normalization에서 Mean Centrering 과정을 빼고 Scaling만 진행하는 것

이 때 두 Normalization 모두,
- 입력의 통계량을 구하는 과정(Reduction Algorithm)에서 **O(n)의 시간복잡도가 발생**함. 
- 한 feature의 출력이 다른 feature의 값에 영향을 받음 

그런데 과연 

> Normalization 효과를 얻기 위해 반드시 입력의 통계량을 계산해야 하는가?

논문의 접근은 LN을 단순히 삭제하는 것이 아니라, **LN이 실제로 activation에 가하는 변환을 관찰하고 그 효과를 더 단순한 연산으로 대체하는 것**임.



# 3. What does Normalization do? 
###### - Normalization Layer는 값을 어떻게 바꾸는가?
![[Pasted image 20261001231723.png]]
> Figure 2. ViT, Wav2vecc, Dit에서 추출한 LN의 입출력(Normalization Layer의 파라미터 적용 전, 즉 $N(0,1)$의 출력)

- 초기 Layer --> 입출력이 선형관계에 가까움 
- 깊은 Layer --> 중심부는 직선을 이루지만 절대값이 큰 입력에 대해 S자 곡선을 이룸.
	그리고 그 곡선은 Figure 3. 에서 보다시피 $tanh(ax)$와 비슷한 형태를 띔.
- 0 근처에서는 선형 변환의 형태를 띔

실험 결과, 99%의 점들은 선형적인 구간에서 나타나고 나머지 값들은 Extreme Value(절대값이 큰 값)로 상대적으로 강한 압축이 적용됨

![[Pasted image 20261001232230.png]]
> Figure 3. alpha에 따른 $tanh(ax)$의 그래프

$tanh(ax)$의 alpha 값에 따라 중심부의 기울기와 압축의 범위가 달라짐. 이는 $tanh(ax)$로 Figure 2. 에서 나타난 Activation을 표현할 수 있음을 나타냄 

![[Pasted image 20261001232214.png]]
> Figure 4. 왼쪽 두 개 그림은 토큰 단위, 오른쪽 두 개는 채널 단위로 점을 칠한 것

1. Token 단위 
	- Normalization은 토큰 단위로 이뤄져 있기 때문에 한 토큰의 channel 값들은 직선을 이룸 --> **Token 별로 선형이다!**
	- 분산이 큰 토큰일 수록 기울기가 작음 
2. Channel 단위 
	- Extreme Activation에 특정 Channel에 집중되어 나타남

###### - 그러면 단순한 아핀 변환으로 대체할 수 있는 거 아닌가?
![[Pasted image 20261003153133.png]]
결과적으로 **Normalization은 일종의 선형 변환**처럼 볼 수 있기 때문에 ![[Pasted image 20261003163015.png]]와 같은 아핀 변환으로 대체할 수 있을 것처럼 보임. 

하지만 저자들은 아핀 변환만으로 중심부에서의 선형적 값의 변환과 Extreme Activation에 대한 강한 압축을 하는 방식을 inductive하게 학습하는 것에는 한계가 있다고 봄 
- Why?(논문 외의 내용)
	1. Normalization == Input-adaptive Transformation
		: 만약 입력값이 100배 커진다고 하면 Normalization은 activation이 유지되는 반면 affine은 activation이 그대로 100배 증가하게 됨
		--> 적절한 affin transformation을 최적화 값을 찾기 어려움, Generality가 떨어짐
	2. Activation의 분포를 $N(0, 1)$로 억제한다는 휴리스틱의 적용 
		: Affine Transformation에는 activation의 크기를 억제하는 기능이 없기 때문에 이를 학습하거나 새로운 방식을 채

+) 본 논문에서 Normalizaiton은 일종의 선형 변환이라고 표현했는데 이는 좀 조심히 볼 필요가 있음. 
- Token 기준으로 Normaliztion Layer가 값을 선형적으로 변환한다는 뜻이지, Shifting과 Scaling의 규모는 token마다 다르기 때문에 Batch 전체로 봤을 때 비선형적임 (그림에서 S자로 나타남)
- Normalization 식을 일반화 하면 ![[Pasted image 20261003172712.png]]와 같음. 때문에 'Adaptive Affine Transformation'라고 논문에서 표현한 Layer는 사실상 비선형성을 가짐 

이를 해석하면, 정규화를 단순히 “평균 0, 분산 1을 만드는 연산”으로 보는 데서 한발 더 나아가 **1. 보통 값은 Scaling만하고 2. Extreme 값은 크게 압축하는 연산**으로 바라본 것임.


# 4. Dynamic Tanh(DyT)
Normalization Layer를 대체하는 DyT Layer 제시 
![[Pasted image 20261003233219.png]]
기존 Normalization이 있던 위치에 DyT를 넣으며 FFN의 Activation인 GELU는 유지함. 
###### - 수식의 특징
- **입력값이 작을 때**: $\tanh(\alpha x)\approx\alpha x$이므로 선형 변환에 가까움 
- **Extreme 값일 때**: $\tanh(\alpha x)\approx +1  or -1$ 값을 압출함
- Normalizaiton과 달리 통계량 계산이 없음 


# 5. Experiments
![[Pasted image 20261004123715.png]]
> Figure 5. LN과 DyT의 loss 곡선이 유사한 형태를 띄는 것으로 보아 유사한 dynamic을 학습한다고 할 수 있음 

![[Pasted image 20261004123944.png|647]]
> Table 1. Supervised vision 모델에서 DyT가 LN 보다 다양한 모델에서 비슷하거나 살짝 더 성능이 좋음 

![[Pasted image 20261004130434.png]]
> Table 2. Self-supervised vison 모델에서도 성능 비슷하게 나타남

![[Pasted image 20261004130328.png]]
> Table 3. Diffusion 모델에서도 성능 비슷하게 나타남

논문에서 말하고자 하는 것은 'DyT가 LN보다 좋다'가 아니라 '기존 LN과 비슷한 성능을 낸다'임

![[Pasted image 20261004131544.png]]
> Figure 6. LLM Pre-training에서도 RMS Norm과 비슷한 Loss 곡선을 그림

![[Pasted image 20261004131726.png]]
> Table 4. Zero-shot task 수행 결과도 유사한 Accuracy를 띔

이 외에도 Self-supervised Speach 모델(Table 5.)이나 다른 DNA Classification 모델에서도 비슷한 학습 양상을 띔

# 6. Analysis
###### - Why tanh?

![[Pasted image 20261004132322.png]]
> Table 7. LN의 대체로 위와 같은 함수를 사용한 결과, 단순 Scaling만 하는 Identity 함수는 발산하고 나머지는 안정적으로 학습됨 

Saturate Function(포화 함수)는 안정적으로 학습된 반면, 단순 Scaling만 하는 Identity 함수는 발산함. Saturate Function은 Extreme value를 크게 제한하는 역할을 할 수 있지만 Identity 함수는 Scaling만으로 그 역할을 하지 못해 발산하게 됨. 

즉, 
> **해당 학습 조건에서는 Scaling만으로 부족하며 비선형적 압축이 중요한 역할을 함.**

![[Pasted image 20261004134924.png|382]]
> Figure 7. 각종 함수 중에서도 $tanh$가 가장 좋은 이유는 Smoothnes와 Zero-Centering이라고 추측함(확정된 설명은 아님)

###### - Why tanh(ax)?
![[Pasted image 20261004133745.png]]
> Table 8. 각종 함수에서 $\alpha$를 제거 했을 때 Accuracy가 떨어짐

$\alpha$는 Learnable Scaler 값으로 **'어느 입력 범위에서 압축을 시작할 것인가?'** 를 결정하는 중요한 요소임. $\alpha$가 클수록 압축하는 입력 값의 범위가 넓어져 분산이 큰 입력 값에 대해 큰 $\alpha$를 학습하게 되어 크게 압축함. 

![[Pasted image 20261004135404.png]]
> Figure 8. 왼쪽: $\alpha$가 LN의 1/std값과 유사한 변화 양상과 유사한 값을 띄는 것을 알 수 있음. 오른쪽: 학습이 끝난 $\alpha$와 1/std 값이 정확하게 일치하는 것은 아니지만 비례관계를 띄고 있는 것을 확인할 수 있음

$\alpha$가 1/std와 관련된 값을 갖는다는 실험결과를 통해 **$\alpha$가 통계량의 계산 없이 Normaliztion의 Scaling의 역할을 부분적으로 수행**한다고 해석함. 그렇다고 두 함수가 동일한 Normalization 역할을 수행한다고 할 수는 없음. 


# 7. Initialization 
###### -$\alpha$ Initializaiton은 모델에 어떻게 영향을 주는가?


###### - In Non-LLM Task
![[Pasted image 20261004142527.png]]
> Figure 9. $\alpha$의 초기 값에 따른 Non-LLM task의 Accuracy의 변화. 

대부분의 Non-LLM Task 모델은 0.2~1.2 사이의 **$\alpha$ 초기 값에 크게 영향을 받지 않음**을 확인할 수 있음. 다만 ViT-large 모델에서 초기 값이 0.6을 넘어갈 때 학습이 제대로 이뤄지지 않았지만, Hyperparameter의 조절을 통해 이를 안정할 수 있었음. 

###### - In LLM Task
![[Pasted image 20261004143040.png]]
> Figure 10. 깊고 넓은 모델에서 $\alpha$ 초기값과 lr이 클수록 학습 실패율이 높아짐. 또한 $\alpha$의 초기값이 0.5일 때 LN과 비슷한 양상을 보임 

결과 분석 
- DyT는 모델의 깊이보다 넓이에 더 많은 영향을 받음 
- 큰 모델일 수록 더 작은 $\alpha$ 초기값 및 lr을 요구함 
- $\alpha$가 0.5일 떄 LN과 비슷한 양상을 띄고 Figure 9.에서의 결과를 고려해 기본 초기값을 0.5로 설정함 
	--> 그렇다면 모든 DyT Layer에 대해 $\alpha = 0.5$를 일괄 적용하는게 가장 좋은 방법일까? 아니면 무작정 작게 하는게 좋을까?

![[Pasted image 20261005153458.png]]
> Figure 11. LLM에서 Attention Block과 그 외 Block의 $\alpha$ 초기값을 달리하여 Pre-training 한 뒤 training loss를 Heatmap으로 나타냄 

![[Pasted image 20261005153653.png]]
> Table 10. 가장 높은 Accuracy를 갖는 $\alpha$의 초기값의 조합

이러한 결과를 통해 도출할 수 있는 결론은
1. **큰 모델일 수록 더 작은 초기값이 유리함**
2. **Attention에는 다른 Block보다 큰 초기값을 요구함** 

이처럼 DyT가 $\alpha$의 초기값에 크게 영향을 받는 이유는 **$\alpha$가 입력값 압축의 범위를 결정**하기 때문이다. Normalization Layer의 경우 압축의 범위를 입력마다 가변적으로 결정한다. 하지만 학습 첫 시행시 고정된 초기 $\alpha$에 의해 Extreme Value가 아님에도 압축되는 현상이 발생할 수 있다. 

또한 $\alpha$의 초기값은 순전파와 역전파에 둘 다 영향을 줌 
- Forward Pass: $tanh(\alpha x)$ 전달 ($\gamma \, \beta$ 생략)
- Backward Pass: $\alpha(1-tanh\square(\alpha x)$ ($\gamma \, \beta$ 생략)
이로 인해 한 번 압축된 값은 예측에서(순전파) 제 역할을 하지 못하고, 학습(역전파) 과정에서는 0에 가까운 Gradient를 전달받아 제대로 학습할 수 없음

![[Pasted image 20261005154832.png]]
> Table 11. 모델의 너비와 깊이에 따른 $\alpha$의 초기값의 양상. 모델의 깊이보다는 너비에 더 민감하게 반응하는 것을 알 수 있음 

이를 통해 저자들은 LLM의 초기 민감성이 매우 큰 너비와 관련이 깊을 수 있다고 함. 



# 8. Related Works

###### 1. Mechanisms of Normalization Layers
![[Pasted image 20261005161801.png]]

해당 논문은 주로 Batch Normalization을 중심으로 설명함. 본 논문에서는 Layer Normalization을 토큰 단위에서는 Scaling + Mean-centering, Channel 단위에서는 Scaling + Extreme Value 비선형 압축으로 해석함 

###### 2. Normalization In Transformation 
- LN자체가 Non-linearity를 가지므로 Representation Capacity를 확장하는 역할도 함 
- Normalization Layer의 위치에 따라 모델의 Convergence 특성이 다르게 나타남 

###### 3. Removing Normalization(Normalization-free ResNet)
initialization·weight 제어·gradient clipping·augmentation·regularization을 조합하는 방식으로 높은 성능을 달성했다고 소개함
우리는 더 쉬운거로 대체했다고 연구진들이 자랑하고 있음 



# 9. Limitation 
###### 1. Layer, RMS Normalization 외의 다른 형태의 Normalization을 대체할 수는 없음 
![[Pasted image 20261005164401.png]]
> Table 16. BN의 대체 결과 Accuracy가 크게 하락함 

###### 2. 구조가 단순한거지 계산이 빠르진 않음 
![[Pasted image 20261005164647.png]]
> Table 15. Compile 이후 RMS Normalizaiton이랑 DyT랑 실행 시간이 같음 

tanh 함수도 더 좋은 최적화 기법이 나오지 않을까 연구진이 시발 기대하고 있다네... 니들이 찾으세요
근데 이러면 진짜 대체할 이유가 없지 않나 싶음. 뭘 위해 열심히 이 논문을 읽었는지 모르겠음 
심지어 하이퍼파라미터 설정하겠다고 모델 몇 번 씩 쳐 돌릴거 생각하면 참...



# 10. Conclusion
1. 일단은 Transformer 구조에서 Normalization Layer 없이도 학습될 수 있다는 것을 보임 
2. Normalization Layer의 역할을 정의함 
3. 끗


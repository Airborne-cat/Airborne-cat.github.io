---
layout: post
title: "Reinforcement Learning with Verifiable Rewards"
date: 2026-11-17 00:00:00 +0900
tags: [paper-review]
categories: [paper-review]
math: true
toc:
  sidebar: right
  collapse: auto
related_posts: false
---


> RLVR은 최종 답안에 대해서만 Reward를

# 1. Motivation

### 1.1 RLVR은 정말 reasoning을 향상시키는가?
###### RLVR이란?
: Reinforcement Learning with Verifiable Rewards의 준말로 LLM이 문제를 풀게 한 뒤 그 결과를 reward로 강화학습 하는 방식. (GRPO의 Award를 설정하기 위한 방식)

+) 이때 LLM이 푸는 문제는 Verifiable Reward를 지녀야 함(명확한 정답이 있어야 함)

![Pasted image 20260927184034]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260927184034.png' | relative_url }})
(COT = Chain Of Thought, 추론 과정)
###### 특징
- Reward는 정답인지 아닌지만 확인하는 Binary Reward를 줌
- COT가 아닌 최종 답안에 대해서만 Reward 제공

==> 이에 연구진은 최종 답안에 대해서만 Reward를 제공하는데 모델이 올바른 Reasoning을 배울 수 있을까?

### 1.2 이전 연구의 RLVR에 대한 주장

###### Pass@k란?
: 한 문제에 대해 k번 시행해서 한 번이라도 맞출 확률 도출
- Auto Regressive 모델은 출력된 확률 분포에서 단어를 랜덤하게 하나 골라 출력함
- ![Pasted image 20260927193839]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260927193839.png' | relative_url }})                                            ![Pasted image 20260927193903]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260927193903.png' | relative_url }})
- 때문에 같은 입력 문장에 대해서 다른 출력을 낼 수 있음
	--> Pass@K가 낮음 == Sampling Probability가 낮음
###### 이전 주장 1.
> Sampling Probability가 낮다 == RLVR 학습 이전의 base 모델에 정답은 sample에 있지만 그 확률이 낮음
> > --> **RLVR == Sampling Probability를 높인다**

###### 이전 주장 2.
- Spurious Guess
-
><img src="{{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260927195505.png' | relative_url }}" alt="Pasted image 20260927195505" width="226"> --> <img src="{{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260927195519.png' | relative_url }}" alt="Pasted image 20260927195519" width="269">
> K의 크기를 충분히 키우면(더 많이 Sampling 하면) Base 모델과 RLVR 이후의 모델의 Pass@K 점수가 근사하므로
> > --> Pass@K의 증가가 모델 능력의 향상을 뜻하는 것은 아닐 수 있음
> > --> **RLVR은 Sampling Efficiency는 높이지만 Reasoning Capacity는 오히려 감소!(새로운 Reasoning을 찾아내는 것은 아님)**
> > +) 논문에서는 Reasoning Capacity가 감소한다고 했지만 더 이상 증가하지 않는다고 보는게 더 타당함

![Pasted image 20260928131951]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928131951.png' | relative_url }})

# 2. 이에 대한 반박

### 2.1 CoT-Pass@K

###### Pass@K의 문제점
> **정답 != 올바른 COT**
- K가 충분히 크고 final answer가 짧은 형태라면 정답을 우연히 맞출 가능성이 큼
	- --> 단순히 많은 종류의 답을 sampling 하면 Pass@K 점수가 오름
	- == Spurious Guess Problem
	- 즉, Incorrect CoT + Correct Answer도 정답으로 취급하기 때문에 왜곡될 수 있음
###### COT-Pass@k란?
: Reward를 최종 보상 뿐만 아니라 CoT에 대해서도 부여
- Correct CoT && Correct Answer ==> CoT-Pass@K == 1
- 수학적으로 다음과 같이 정의함
- G = 총 Response 개수
- C = Correct Answer
- D = Correct Answer + Correct CoT
- ![Pasted image 20260927202231]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260927202231.png' | relative_url }})

###### CoT의 Correct 여부는 어떻게 판단하는가?

- (수학)CoT는 정답과 달리 논리적 타당성을 따져야 하기 때문에 Correct 여부를 판단하기 어려움
	--> 그래서 짜잔! **만능 Judge LLM 사용하기** (Deepseak1 Qwen 8b)(요즘 뭐만하면 ㅇㅈㄹ 하는 논문이 너무 많음)
- (코드) 잘못 된 Reasoning을 통해 나온 정답이 Correct Answer로 이어질 가능성이 낮음
	--> Pass@K 적용하는게 비교적 신뢰할만함
- All correct: 3/3 정답
- Majority Correct: 2/3 정답
- Any Correct: 1/3 정답
	--> 1만 맞아도 동일한 Correct Reward 제공
	--> 이렇게 하면 정답의 개수가 늘어나 False Positive, False Negative가 완화 됨
		![Pasted image 20260928132607]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928132607.png' | relative_url }})

+) CoT-Pass@K의 적용은 어디까지 기존 RLVR의 검증용임. 이걸 Reward로 모델 학습을 하는 것은 아님

# 3. 검증!

### 3.1 Math Reasoning

![Pasted image 20260928142504]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928142504.png' | relative_url }})
###### Figure 2. 설명
- (기존 가설)Pass@K가 K가 증가함에 따라 Base LLM이 RLVR LLM을 따라잡음
	--> 정답에 대한 Sample이 기존 Base 모델에도 존재했다는 뜻이므로,
		**RLVR은 Reasoning Capacity는 감소시키고 Sampling Efficiency만 증가시킨다** 라고 이전 연구에서 본거임
- (새로운 가설) 하지만 CoT Pass@K를 보면 특정 Benchmark에서 **Base와 RLVR사이의 갭**이 유지됨 --> **이 갭이 RLVR이 Reasoning Capacity를 증가시킨다는 근거**(Extended Reasoning Boundary)

###### Benchmark마다 결과의 차이가 있는 이유?
1. Math-500, AMC23
	: Base LLM과 RLVR 사이의 갭이 따라 잡힘
	1. Data Contamination
		: 이미 모델의 Pre-training과정에서 해당 내용을 봤을 수도 있음
	2. 문제가 너무 쉬움
		: 문제가 너무 쉬워서 Base LLM이 문제를 푸는데 어려움이 없음
2. AIME 2025
	: 둘 사이의 간극이 큼
	1. 최신 논문이라 Data Conta가 적음
3. Minerva
	: RLVR로 인한 Improvement가 거의 없음
	1. Train-Test domain mismatch
		: Minerva는 Physics와 free-form answer 형태의 문제가 많은데 Base LLM training에 활용되는 데이터는 보통 integer-answer math 문제가 많기 때문

### 3.2 Code Reasoning
![Pasted image 20260928163514]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928163514.png' | relative_url }})
- CoT까지 갈 것도 없이 이미 Pass@K에서 Base 모델이 RLVR 모델을 못 따라옴
- Extended reasoning capability boundary가 나타남
![Pasted image 20260928165453]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928165453.png' | relative_url }})
- LiveCodeBench 어려운 문제일 수록 간극이 더 큼 --> 어려운 문제일 수록 Reasoning Boundary를 구분하기 더 쉽다~

### 3.3 Distilled Model + Math Problem(Appendix)
--> 잘 모르겠음...

### 4. Theoretical Understanding of RLVR
CoT Correctness를 Reward로 주지 않는데 Reasoning Boundary가 어떻게 증가하는가?

###### 4.1 Problem Setup
![Pasted image 20260928171510]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928171510.png' | relative_url }})
![Pasted image 20260928171548]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928171548.png' | relative_url }})
- - \(c_i\): Chain-of-Thought
- \(a_i\): Final Answer
- Reward는 Final Answer에 대해서만 제공

###### 4.2 Logic Prior(선행 논리)
<img src="{{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020261008172753.png' | relative_url }}" alt="Pasted image 20261008172753" width="314"> ><img src="{{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928173406.png' | relative_url }}" alt="Pasted image 20260928173406" width="301">
- **"CoT가 올바를 때가 CoT가 틀릴 때보다 정답을 구할 확률이 높다"**
- 해당 Logic Prior가 작동하기 위해서는 '**모델이 Pre-training 되었다'는 가정**이 있어야 함
	- Pre-training을 통해 획득된 기본적인 지식 때문에 <img src="{{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928180058.png' | relative_url }}" alt="Pasted image 20260928180058" width="64">가 성립함

###### 4.3 Theorem 1.
-----
+) GRPO(LLM을 위한 PPO 강화학습 기법)
- RLVR은 GRPO 학습의 Advatage를 설정하기 위한 과정임
- ![Pasted image 20260928173832]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928173832.png' | relative_url }})
- Advantage는 다음과 같이 Reward를 정규화하여 결정함
----------

![Pasted image 20260928174536]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928174536.png' | relative_url }})<img src="{{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928174543.png' | relative_url }}" alt="Pasted image 20260928174543" width="402">
![Pasted image 20260928174557]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928174557.png' | relative_url }})
- 위와 같다고 할 때 Correct CoT의 Expected Advantage는
	![Pasted image 20260928174655]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928174655.png' | relative_url }})
- 반대로 Incorrect CoT의 Expected Advatage는
	![Pasted image 20260928174741]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928174741.png' | relative_url }})
- Logic Prior에 의하면
	![Pasted image 20260928174837]({{ '/assets/img/obsidian/reinforcement-learning-with-verifiable-rewards/Pasted%20image%2020260928174837.png' | relative_url }})
	이므로 **CoT Correctness에 대한 직접적인 Reward를 제공하지 않더라도**, **최종 정답 여부와 상관 없이** $Correct CoT$에 대해 양의 Award, $Incorrect CoT$에 대해 음의 Award가 주어지며 모델은 **올바른 CoT를 학습**할 수 있음.

---------
알파=1, 베타=0일 때 cot 갱신이 이뤄지지 않음
